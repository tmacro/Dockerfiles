#!/bin/sh

set -ex

/usr/local/bin/apply-config.sh

exec /usr/bin/supervisorctl -c /supervisord.conf signal SIGHUP prometheus
