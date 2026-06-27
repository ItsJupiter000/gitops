#!/bin/bash

# Find the Minikube IP
MINIKUBE_IP=$(minikube ip)

echo "🚀 Starting Load Test on $MINIKUBE_IP (stock-pulse.local)..."
echo "Sending 10 requests rapidly. You should see '200 OK' for the first two, and '503 Service Temporarily Unavailable' for the rest!"
echo "------------------------------------------------------"

# Loop 10 times to send rapid requests
for i in {1..10}
do
  # Use curl, resolve stock-pulse.local to the minikube IP, and print only the HTTP status code
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: stock-pulse.local" http://$MINIKUBE_IP/)
  
  if [ "$STATUS" == "503" ]; then
    echo "Request $i: 🔴 BLOCKED by Rate Limiter (HTTP 503)"
  elif [ "$STATUS" == "200" ]; then
    echo "Request $i: 🟢 SUCCESS (HTTP 200)"
  else
    echo "Request $i: 🟡 HTTP $STATUS"
  fi
done

echo "------------------------------------------------------"
echo "Load test complete!"
