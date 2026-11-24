#!/usr/bin/env bash
# Run TalkMate from this laptop so anyone on the same Wi-Fi can open it in a browser.
#
#   npm run demo
#
# Optional overrides:
#   LAN_IP=192.168.1.20   use this address instead of the detected one
#   API_PORT=3001         backend port (3001 so it never clashes with the dev backend on 3000)
#   APP_PORT=4173         port classmates open in the browser
#   API_DIR=../odin-messaging-api   where the backend lives
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="${API_DIR:-$APP_DIR/../odin-messaging-api}"
API_PORT="${API_PORT:-3001}"
APP_PORT="${APP_PORT:-4173}"

# Which address classmates should use:
#  1. a connection shared from this laptop (Ubuntu "Shared to other computers" = 10.42.x.1),
#     e.g. a cable to a router's WAN port; the router's Wi-Fi users reach the laptop there
#  2. otherwise the first real network address (skips VPNs like Cloudflare WARP, Docker, ...)
detect_ip() {
  local addrs
  addrs="$(ip -4 -o addr show scope global up 2>/dev/null |
    awk '$2 !~ /^(docker|br-|veth|virbr|CloudflareWARP|tun|tap|tailscale|wg|zt)/ { split($4, a, "/"); print a[1] }')"
  echo "$addrs" | grep -m1 '^10\.42\.' || echo "$addrs" | head -n1
}

LAN_IP="${LAN_IP:-$(detect_ip)}"
if [ -z "$LAN_IP" ]; then
  echo "Couldn't find this laptop's Wi-Fi address. Connect to the Wi-Fi first,"
  echo "or set it yourself:  LAN_IP=192.168.x.x npm run demo"
  exit 1
fi

if [ ! -f "$API_DIR/app.js" ]; then
  echo "Backend not found at $API_DIR (set API_DIR=/path/to/odin-messaging-api)"
  exit 1
fi

port_busy() { ss -ltn "sport = :$1" 2>/dev/null | grep -q LISTEN; }
for port in "$API_PORT" "$APP_PORT"; do
  if port_busy "$port"; then
    echo "Port $port is already in use. Stop what's running there (e.g. your dev backend) and try again."
    exit 1
  fi
done

APP_URL="http://$LAN_IP:$APP_PORT"
API_URL="http://$LAN_IP:$API_PORT"

echo "==> Building the app to talk to $API_URL"
# an existing environment variable beats the value in .env
(cd "$APP_DIR" && VITE_API_URL="$API_URL" npm run build)

echo "==> Starting the backend on port $API_PORT"
(
  cd "$API_DIR"
  # pictures are stored on this laptop, so photos work with no internet
  PORT="$API_PORT" CLIENT_ORIGINS="$APP_URL,http://localhost:$APP_PORT" \
    UPLOAD_STORAGE=local PUBLIC_API_URL="$API_URL" exec node app.js
) &
API_PID=$!
trap 'echo; echo "Stopping..."; kill "$API_PID" 2>/dev/null || true' EXIT INT TERM

# give the backend a moment, and stop early if it crashed (e.g. MongoDB isn't running)
sleep 2
if ! kill -0 "$API_PID" 2>/dev/null; then
  echo "The backend stopped. Is MongoDB running?  sudo systemctl start mongod"
  exit 1
fi

cat <<EOF

  ┌──────────────────────────────────────────────────┐
     TalkMate is live on this Wi-Fi

     Classmates open:   $APP_URL
     On this laptop:    http://localhost:$APP_PORT
  └──────────────────────────────────────────────────┘

  Everyone must be on the same Wi-Fi as this laptop. Press Ctrl+C to stop.
EOF

if command -v qrencode >/dev/null 2>&1; then
  qrencode -t ansiutf8 "$APP_URL"
else
  echo "  (Tip: sudo apt install qrencode  to show a QR code here for phones)"
fi
echo

cd "$APP_DIR"
npx vite preview --host 0.0.0.0 --port "$APP_PORT" --strictPort
