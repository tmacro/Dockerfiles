#!/usr/bin/env sh

# This script is used to refresh the mirrorlist in a loop.

set -e

if [ -z "$REFLECTOR_ARGS" ]; then
    REFLECTOR_ARGS="-c US --sort rate -l 10 -p https"
fi

if [ -z "$REFLECTOR_FILE" ]; then
    REFLECTOR_FILE="/opt/reflector/mirrorlist"
fi

REFLECTOR_ARGS="$REFLECTOR_ARGS --save $REFLECTOR_FILE"

if [ ! -d "$(dirname $REFLECTOR_FILE)" ]; then
    mkdir -p "$(dirname $REFLECTOR_FILE)"
fi

if [ ! -f "$REFLECTOR_FILE" ]; then
    touch "$REFLECTOR_FILE"
fi

if [ -z "$REFLECTOR_INTERVAL" ]; then
    reflector $REFLECTOR_ARGS
    exit 0
fi

while true; do
    echo "[$(date -Iseconds)] Refreshing mirrorlist..."
    reflector $REFLECTOR_ARGS
    echo "[$(date -Iseconds)] Sleeping for $INTERVAL..."
    sleep $INTERVAL
done
