#!/bin/sh

MINIKUBE_IP=$(minikube ip)
ENDPOINT="http://$MINIKUBE_IP/api/whoami"
TOTAL_REQUESTS=100

# ANSI Colors - each pod gets its own color
C1='\033[0;34m'   # Blue      - Pod 1
C2='\033[0;32m'   # Green     - Pod 2
C3='\033[0;33m'   # Yellow    - Pod 3
C4='\033[0;35m'   # Magenta   - Pod 4
C5='\033[0;36m'   # Cyan      - Pod 5
CR='\033[0;31m'   # Red       - Unknown/Error
NC='\033[0m'      # Reset color
BOLD='\033[1m'

echo ""
printf "${BOLD}========================================================${NC}\n"
printf "${BOLD}  ⚖️  StockPulse Live Load Balancer Tracker${NC}\n"
printf "${BOLD}  Firing $TOTAL_REQUESTS requests across 5 pods...${NC}\n"
printf "${BOLD}========================================================${NC}\n\n"

# Track pod assignments (pod short-names mapped to colors)
POD_MAP=""
POD_COLORS=""
POD_COLOR_INDEX=0
RESULTS=""

get_or_assign_color() {
  POD=$1
  # Check if this pod already has a color
  INDEX=1
  for ENTRY in $POD_MAP; do
    if [ "$ENTRY" = "$POD" ]; then
      # Return color by index
      case $INDEX in
        1) echo "$C1" ;; 2) echo "$C2" ;; 3) echo "$C3" ;;
        4) echo "$C4" ;; 5) echo "$C5" ;; *) echo "$CR" ;;
      esac
      return
    fi
    INDEX=$((INDEX + 1))
  done

  # New pod - assign next color
  POD_MAP="$POD_MAP $POD"
  COUNT=$(echo "$POD_MAP" | wc -w)
  case $COUNT in
    1) echo "$C1" ;; 2) echo "$C2" ;; 3) echo "$C3" ;;
    4) echo "$C4" ;; 5) echo "$C5" ;; *) echo "$CR" ;;
  esac
}

for i in $(seq 1 $TOTAL_REQUESTS)
do
  RESPONSE=$(curl -s -H "Host: stock-pulse.local" "$ENDPOINT" 2>/dev/null)
  POD=$(echo "$RESPONSE" | sed 's/.*"pod":"\([^"]*\)".*/\1/')

  # Get a short name (last 8 chars of pod name)
  SHORT=$(echo "$POD" | rev | cut -c1-8 | rev)

  COLOR=$(get_or_assign_color "$POD")

  # Pad request number
  NUM=$(printf "%3d" $i)

  printf "  Req ${BOLD}${NUM}${NC} → ${COLOR}${BOLD}● Pod: ...${SHORT}${NC}\n"
  RESULTS="$RESULTS $POD"
done

echo ""
printf "${BOLD}========================================================${NC}\n"
printf "${BOLD}  📊 Final Summary - Per-Pod Request Distribution${NC}\n"
printf "${BOLD}========================================================${NC}\n"

# Build summary
POD_LIST=$(echo "$RESULTS" | tr ' ' '\n' | sort | uniq)
for POD in $POD_LIST
do
  if [ -z "$POD" ]; then continue; fi
  COUNT=$(echo "$RESULTS" | tr ' ' '\n' | grep -c "^${POD}$")
  SHORT=$(echo "$POD" | rev | cut -c1-8 | rev)
  COLOR=$(get_or_assign_color "$POD")
  BAR=$(printf '%0.s█' $(seq 1 $COUNT) | head -c 50)
  PCT=$(( COUNT * 100 / TOTAL_REQUESTS ))
  printf "  ${COLOR}${BOLD}● ...${SHORT}${NC}  ${COLOR}${BAR}${NC}  ${BOLD}${COUNT} reqs (${PCT}%%)${NC}\n"
done
printf "${BOLD}========================================================${NC}\n\n"
