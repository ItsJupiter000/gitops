#!/bin/bash

# ===============================
# 🚀 StockPulse Rate Limit Tester
# ===============================

MINIKUBE_IP=$(minikube ip)
HOST="stock-pulse.local"

TOTAL_REQUESTS=100
DELAY_BETWEEN_REQUESTS=0   # change to 3 for real RPM simulation

# Counters
SUCCESS=0
BLOCKED=0
OTHER=0

echo "======================================================"
echo "🚀 STOCK-PULSE LOAD TEST STARTED"
echo "🌐 Target: http://$MINIKUBE_IP (Host: $HOST)"
echo "📊 Total Requests: $TOTAL_REQUESTS"
echo "⏱️ Delay Between Requests: ${DELAY_BETWEEN_REQUESTS}s"
echo "======================================================"

for i in $(seq 1 $TOTAL_REQUESTS)
do
  TIMESTAMP=$(date +"%H:%M:%S")

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Host: $HOST" \
    http://$MINIKUBE_IP/)

  if [ "$STATUS" = "200" ]; then
    echo "[$TIMESTAMP] Request $i: 🟢 SUCCESS (200 OK)"
    SUCCESS=$((SUCCESS+1))

  elif [ "$STATUS" = "503" ] || [ "$STATUS" = "429" ]; then
    echo "[$TIMESTAMP] Request $i: 🔴 RATE LIMITED ($STATUS)"
    BLOCKED=$((BLOCKED+1))

  else
    echo "[$TIMESTAMP] Request $i: 🟡 OTHER RESPONSE ($STATUS)"
    OTHER=$((OTHER+1))
  fi

  # simulate real traffic pattern
  if [ "$DELAY_BETWEEN_REQUESTS" -gt 0 ]; then
    sleep $DELAY_BETWEEN_REQUESTS
  fi
done

echo "======================================================"
echo "📊 FINAL REPORT"
echo "🟢 Success  : $SUCCESS"
echo "🔴 Blocked  : $BLOCKED"
echo "🟡 Other    : $OTHER"
echo "======================================================"

echo "🏁 Load test complete!"