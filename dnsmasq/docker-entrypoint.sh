#!/bin/sh

if [ -n "$BIND_ADDRESS" ]; then
    EXTRA_OPTIONS="$EXTRA_OPTIONS --listen-address=${BIND_ADDRESS} --bind-interfaces"
fi

printf "Starting dnsmasq...\t"

dnsmasq $EXTRA_OPTIONS --conf-file=/etc/dnsmasq.conf &
PID="$!"

printf "[OK]\n"

cleanup() {
    printf "\t[OK]\nExiting...\t\t"
    kill -s SIGTERM $PID
    wait $PID
    printf '[OK]\n'
    exit 0
}

trap cleanup SIGINT SIGTERM SIGQUIT SIGABRT

printf "Waiting for exit..."
wait $PID
