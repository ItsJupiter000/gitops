#!/bin/sh

TOTAL_REQUESTS=100

echo ""
echo "========================================================"
echo "  ⚖️  StockPulse TRUE Load Balancer Test"
echo "  Running requests INSIDE the cluster via kube-proxy"
echo "  so Kubernetes can properly round-robin across 5 pods!"
echo "========================================================"
echo ""
echo "🚀 Launching temporary test pod inside cluster..."

# Run a temporary Alpine pod INSIDE the cluster.
# From there, we hit the ClusterIP Service by its DNS name.
# Kubernetes kube-proxy will properly round-robin across all 5 pods.
kubectl run lb-tester \
  --image=alpine \
  --rm \
  --restart=Never \
  -it \
  --command -- sh -c "
apk add -q wget 2>/dev/null

echo 'Connected! Firing $TOTAL_REQUESTS requests to stock-pulse-active service...'
echo '--------------------------------------------------------'

RESULTS=''
i=1
while [ \$i -le $TOTAL_REQUESTS ]; do
  RESP=\$(wget -qO- http://stock-pulse-active:3000/api/whoami 2>/dev/null)
  POD=\$(echo \"\$RESP\" | sed 's/.*\"pod\":\"\([^\"]*\)\".*/\1/')
  SHORT=\$(echo \"\$POD\" | rev | cut -c1-15 | rev)
  echo \"  Req \$(printf '%3d' \$i) → Pod: ...\$SHORT\"
  RESULTS=\"\$RESULTS \$POD\"
  i=\$((i + 1))
done

echo ''
echo '========================================================'
echo '  📊 Final Distribution'
echo '========================================================'
echo \"\$RESULTS\" | tr ' ' '\n' | sort | uniq -c | sort -rn | while read COUNT POD; do
  [ -z \"\$POD\" ] && continue
  SHORT=\$(echo \"\$POD\" | rev | cut -c1-20 | rev)
  PCT=\$((COUNT * 100 / $TOTAL_REQUESTS))
  BARS=\$((COUNT / 2))
  BAR=\$(seq 1 \$BARS | sed 's/.*/█/' | tr -d '\n')
  echo \"  ● ...\$SHORT  \$BAR  \$COUNT reqs (\${PCT}%)\"
done
echo '========================================================'
"
