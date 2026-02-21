#!/bin/sh
set -e

: ${PORT:=8080}

# Substitute ${PORT} into nginx config template and write default.conf
envsubst '$PORT' < /etc/nginx/conf.d/nginx.conf > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
