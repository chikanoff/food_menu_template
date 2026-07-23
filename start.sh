#!/bin/sh
set -eu

export PORT="${PORT:-8080}"

envsubst '${PORT}' < /etc/nginx/nginx.railway.conf.template > /etc/nginx/conf.d/default.conf

uvicorn app.main:app --host 127.0.0.1 --port 8000 &
API_PID=$!

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  if curl -fsS "http://127.0.0.1:8000/api/v1/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

nginx -g 'daemon off;' &
NGINX_PID=$!

term() {
  kill -TERM "$NGINX_PID" "$API_PID" 2>/dev/null || true
  wait "$NGINX_PID" 2>/dev/null || true
  wait "$API_PID" 2>/dev/null || true
}
trap term INT TERM

while kill -0 "$API_PID" 2>/dev/null && kill -0 "$NGINX_PID" 2>/dev/null; do
  sleep 1
done

term
exit 1
