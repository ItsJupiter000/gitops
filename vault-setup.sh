#!/bin/sh

# =================================================================
# vault-setup.sh — Run ONCE after Vault is deployed.
#
# BEFORE RUNNING, set your secrets in the terminal (NOT in this file):
#
#   export DOCKERHUB_TOKEN="your-dockerhub-token-here"
#   export NEXTAUTH_SECRET="$(openssl rand -base64 32)"
#   sh vault-setup.sh
#
# This file is SAFE to commit to Git. It contains zero real secrets.
# =================================================================

# --- Guard: fail immediately if secrets are not set in environment ---
if [ -z "$DOCKERHUB_TOKEN" ]; then
  echo "❌ DOCKERHUB_TOKEN is not set. Run:"
  echo "   export DOCKERHUB_TOKEN='your-token-here'"
  exit 1
fi
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ NEXTAUTH_SECRET is not set. Run:"
  echo "   export NEXTAUTH_SECRET=\"\$(openssl rand -base64 32)\""
  exit 1
fi

# --- Find the Vault pod ---
VAULT_POD=$(kubectl get pods -n vault -l app.kubernetes.io/name=vault -o jsonpath='{.items[0].metadata.name}')
if [ -z "$VAULT_POD" ]; then
  echo "❌ No Vault pod found. Is Vault running?"
  echo "   Run: kubectl get pods -n vault"
  exit 1
fi
echo "✅ Found Vault pod: $VAULT_POD"

echo ""
echo "🔑 Step 1: Enable Kubernetes Auth Method..."
kubectl exec -n vault $VAULT_POD -- vault auth enable kubernetes 2>/dev/null \
  || echo "   ↳ Already enabled, skipping."

echo ""
echo "🔗 Step 2: Configure Vault to trust this Kubernetes cluster..."
kubectl exec -n vault $VAULT_POD -- sh -c '
vault write auth/kubernetes/config \
  kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443"
'

echo ""
echo "📦 Step 3: Enable the KV secrets engine..."
kubectl exec -n vault $VAULT_POD -- vault secrets enable -path=secret kv-v2 2>/dev/null \
  || echo "   ↳ Already enabled, skipping."

echo ""
echo "🔒 Step 4: Storing secrets from your environment into Vault..."
# Credentials come from shell env vars — never hardcoded in this file
kubectl exec -n vault $VAULT_POD -- vault kv put secret/stock-pulse \
  DOCKERHUB_USERNAME="jupiter000" \
  DOCKERHUB_TOKEN="$DOCKERHUB_TOKEN" \
  NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

echo ""
echo "📜 Step 5: Create access policy..."
kubectl exec -n vault $VAULT_POD -- vault policy write stock-pulse-policy - <<EOF
path "secret/data/stock-pulse" {
  capabilities = ["read"]
}
EOF

echo ""
echo "🎫 Step 6: Bind policy to Kubernetes ServiceAccount..."
kubectl exec -n vault $VAULT_POD -- vault write auth/kubernetes/role/stock-pulse \
  bound_service_account_names=stock-pulse \
  bound_service_account_namespaces=default \
  policies=stock-pulse-policy \
  ttl=1h

echo ""
echo "========================================================"
echo "✅ Vault configured! Verify with:"
echo "   kubectl exec -n vault $VAULT_POD -- vault kv get secret/stock-pulse"
echo ""
echo "🌐 Vault UI: kubectl port-forward svc/vault -n vault 8200:8200 &"
echo "   Open: http://localhost:8200  |  Token: root"
echo "========================================================"
