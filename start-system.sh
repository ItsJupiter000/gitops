#!/bin/bash
set -e

echo "🚀 Starting Minikube..."
minikube start

echo "⚙️  Ensuring Argo Rollouts controller is installed..."
kubectl create namespace argo-rollouts --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

echo "⏳ Waiting for stock-pulse ACTIVE pod to be ready..."
# Because we are using Rollouts, the pods might take a second to register their labels
sleep 5
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=stock-pulse --timeout=120s

echo "========================================================"
echo "✅ System is running! Opening Port Forwards..."
echo "========================================================"
echo "🔹 ArgoCD Dashboard:  https://localhost:8080 (admin / password)"
echo "🔹 StockPulse Live:   http://localhost:3000"
echo "🔹 StockPulse Test:   http://localhost:3001"
echo "🔹 Grafana UI:        http://localhost:3002 (admin / admin)"
echo "🔹 Prometheus UI:     http://localhost:9090"
echo "========================================================"
echo "(Press Ctrl+C to stop all port forwards)"

# Run port forwards in the background
kubectl port-forward svc/argocd-server -n argocd 8080:443 > /dev/null 2>&1 &
kubectl port-forward svc/stock-pulse-active 3000:3000 > /dev/null 2>&1 &
kubectl port-forward svc/stock-pulse-preview 3001:3000 > /dev/null 2>&1 &
# Optional: sleep for a few seconds to let monitoring pods start before port forwarding
kubectl port-forward svc/monitoring-stack-grafana -n monitoring 3002:80 > /dev/null 2>&1 &
kubectl port-forward svc/monitoring-stack-kube-prom-prometheus -n monitoring 9090:9090 > /dev/null 2>&1 &

# Wait forever until the user presses Ctrl+C
wait
