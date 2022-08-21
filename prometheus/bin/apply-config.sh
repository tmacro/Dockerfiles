#!/bin/sh

set -ex

TO_JAM="/etc/prometheus/stub.yaml"

if [ -f "/etc/prometheus/generated.yaml" ]; then
    TO_JAM="$TO_JAM /etc/prometheus/generated.yaml"
fi

TO_JAM="$TO_JAM $PROM_EXTRA_CONFIG"

/usr/bin/jam -vvv -o /etc/prometheus/prometheus.yaml $TO_JAM
