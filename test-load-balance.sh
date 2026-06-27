#!/bin/sh

MINIKUBE_IP=$(minikube ip)
ENDPOINT="http://$MINIKUBE_IP/api/whoami"
TOTAL_REQUESTS=20

echo "========================================================"
echo "  ⚖️  StockPulse Load Balancer Test"
echo "  Sending $TOTAL_REQUESTS requests to: $ENDPOINT"
echo "  Watch how Kubernetes distributes them across pods!"
echo "========================================================"

# Counters per pod (we'll collect names and count at the end)
RESULTS=""

for i in $(seq 1 $TOTAL_REQUESTS)
do
  RESPONSE=$(curl -s -H "Host: stock-pulse.local" "$ENDPOINT")
  
  # Extract pod name from JSON {"pod":"...","timestamp":"..."}
  POD=$(echo "$RESPONSE" | sed 's/.*"pod":"\([^"]*\)".*/\1/')

  echo "Request $i  →  🟦 Pod: $POD"
  RESULTS="$RESULTS $POD"
done

echo ""
echo "========================================================"
echo "  📊 Summary: How many requests each pod handled"
echo "========================================================"

# Count occurrences of each unique pod name
echo "$RESULTS" | tr ' ' '\n' | sort | uniq -c | sort -rn | while read COUNT POD
do
  if [ -n "$POD" ]; then
    echo "  Pod: $POD  →  handled $COUNT / $TOTAL_REQUESTS requests"
  fi
done

echo "========================================================"
