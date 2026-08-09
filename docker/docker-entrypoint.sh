#!/bin/sh










set -eu

: "${API_ORIGIN:=http://localhost:4000}"
: "${CHATBOT_ORIGIN:=http://localhost:5678}"
export API_ORIGIN CHATBOT_ORIGIN

envsubst '${API_ORIGIN} ${CHATBOT_ORIGIN}' \
  < /etc/nginx/default.conf.template \
  > /etc/nginx/conf.d/default.conf
