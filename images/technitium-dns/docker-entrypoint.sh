#!/usr/bin/env bash

set -ex

if [ ! -d "/etc/dns/apps" ]; then
    echo "Installing Packaged Apps"
    cp -rv /opt/technitium/apps /etc/dns/apps
fi

exec /usr/bin/dotnet /opt/technitium/dns/DnsServerApp.dll /etc/dns
