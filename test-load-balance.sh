#!/bin/sh

TOTAL_REQUESTS=100
LOCAL_PORT=7777

# ANSI Colors
C1='\033[0;34m'   # Blue
C2='\033[0;32m'   # Green
C3='\033[0;33m'   # Yellow
C4='\033[0;35m'   # Magenta
C5='\033[0;36m'   # Cyan
CR='\033[0;31m'   # Red
NC='\033[0m'
BOLD='\033[1m'

echo ""
printf "${BOLD}========================================================${NC}\n"
printf "${BOLD}  ⚖️  StockPulse Live Load Balancer Tracker (5 Pods)${NC}\n"
printf "${BOLD}  Bypassing rate limiter → hitting pods directly${NC}\n"
printf "${BOLD}  Firing ${TOTAL_REQUESTS} requests...${NC}\n"
printf "${BOLD}========================================================${NC}\n\n"

# Start port-forward in background to bypass Ingress rate limiting
printf "🔌 Opening direct tunnel to pods (bypassing rate limiter)...\n"
kubectl port-forward svc/stock-pulse-active ${LOCAL_PORT}:3000 > /dev/null 2>&1 &
PF_PID=$!

# Give port-forward time to connect
sleep 2

ENDPOINT="http://localhost:${LOCAL_PORT}/api/whoami"

# Verify endpoint works
CHECK=$(wget -qO- "$ENDPOINT" 2>/dev/null)
if [ -z "$CHECK" ]; then
  printf "${CR}❌ Could not connect to endpoint. Is the app running?${NC}\n"
  kill $PF_PID 2>/dev/null
  exit 1
fi
printf "✅ Connected! Tracking requests in real-time...\n\n"

# --- State tracking ---
POD_MAP=""   # space-separated list of unique pods seen
RESULTS=""   # space-separated list of pod name per request

get_color() {
  POD=$1
  INDEX=1
  for P in $POD_MAP; do
    [ "$P" = "$POD" ] && break
    INDEX=$((INDEX + 1))
  done
  case $INDEX in
    1) printf "$C1" ;; 2) printf "$C2" ;; 3) printf "$C3" ;;
    4) printf "$C4" ;; 5) printf "$C5" ;; *) printf "$CR" ;;
  esac
}

assign_pod() {
  POD=$1
  for P in $POD_MAP; do
    [ "$P" = "$POD" ] && return
  done
  POD_MAP="$POD_MAP $POD"
}

for i in $(seq 1 $TOTAL_REQUESTS)
do
  RESP=$(wget -qO- "$ENDPOINT" 2>/dev/null)
  POD=$(echo "$RESP" | sed 's/.*"pod":"\([^"]*\)".*/\1/')

  if [ -z "$POD" ] || [ "$POD" = "$RESP" ]; then
    printf "  Req $(printf '%3d' $i) → ${CR}${BOLD}❌ Error (no response)${NC}\n"
    RESULTS="$RESULTS ERROR"
    continue
  fi

  assign_pod "$POD"
  SHORT=$(printf '%.10s' "$POD" | rev | cut -c1-8 | rev)
  COLOR=$(get_color "$POD")

  printf "  Req $(printf '%3d' $i) → ${COLOR}${BOLD}● ...%-10s${NC}\n" "$SHORT"
  RESULTS="$RESULTS $POD"
done

# Kill the background port-forward
kill $PF_PID 2>/dev/null

# --- Summary ---
echo ""
printf "${BOLD}========================================================${NC}\n"
printf "${BOLD}  📊 Final Distribution — Which Pod Got How Many Reqs${NC}\n"
printf "${BOLD}========================================================${NC}\n"

for POD in $POD_MAP
do
  [ -z "$POD" ] && continue
  COUNT=0
  for R in $RESULTS; do
    [ "$R" = "$POD" ] && COUNT=$((COUNT + 1))
  done
  SHORT=$(printf '%s' "$POD" | rev | cut -c1-12 | rev)
  COLOR=$(get_color "$POD")
  PCT=$((COUNT * 100 / TOTAL_REQUESTS))
  BARS=$((COUNT / 3))
  BAR=$(seq 1 $BARS | sed 's/.*/█/' | tr -d '\n')
  printf "  ${COLOR}${BOLD}● ...%-12s${NC}  ${COLOR}%s${NC}  ${BOLD}%d reqs (%d%%)${NC}\n" "$SHORT" "$BAR" "$COUNT" "$PCT"
done

printf "${BOLD}========================================================${NC}\n\n"
