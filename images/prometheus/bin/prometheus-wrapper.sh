#!/bin/sh

DEFAULT_PROM_ARGS="--config.file=/etc/prometheus/prometheus.yaml --storage.tsdb.path=/prometheus  --web.console.libraries=/usr/share/prometheus/console_libraries  --web.console.templates=/usr/share/prometheus/consoles"

PROM_ARGS=""
if [ -z "$NO_DEFAULT_PROM_ARGS" ]; then
    PROM_ARGS="$DEFAULT_PROM_ARGS"
fi

PROM_ARGS="$PROM_ARGS $PROM_EXTRA_ARGS"

# Add a stub config so its valid before dockergen runs for the first time
/usr/local/bin/apply-config.sh


exec /bin/prometheus $@ $PROM_ARGS
