#!/bin/sh










set -eu

: "${BACKEND_UPSTREAM:=http://localhost:4000}"
: "${CHATBOT_UPSTREAM:=http://localhost:5678}"
export BACKEND_UPSTREAM CHATBOT_UPSTREAM

envsubst '${BACKEND_UPSTREAM} ${CHATBOT_UPSTREAM}' \
  < /etc/nginx/default.conf.template \
  > /etc/nginx/conf.d/default.conf
