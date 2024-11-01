#!/usr/bin/env bash

set -e

if [ -z "$VALHEIM_SERVER_PORT" ]; then
    echo "VALHEIM_SERVER_PORT must be set"
    exit 1
fi

if [ -z "$VALHEIM_SERVER_NAME" ]; then
    echo "VALHEIM_SERVER_NAME must be set"
    exit 1
fi

if [ -z "$VALHEIM_SERVER_PASSWORD" ]; then
    echo "VALHEIM_SERVER_PASSWORD must be set"
    exit 1
fi

if [ -n "$VALHEIM_SERVER_PUBLIC" ]; then
    _IS_PUBLIC=1
else
    _IS_PUBLIC=0
fi


if [ ! -f "/data/.installed" ]; then
    echo "Installing Valheim server..."
    /usr/bin/steamcmd +force_install_dir /data/valheim +login anonymous +app_update 896660 validate +exit
    touch /data/.initialized
else
    echo "Updating Valheim server..."
    /usr/bin/steamcmd +force_install_dir /data/valheim +login anonymous +app_update 896660 +quit
fi


echo "Starting Valheim server..."

cd /data/valheim

export LD_LIBRARY_PATH=./linux64:$LD_LIBRARY_PATH
export SteamAppId=892970

./valheim_server.x86_64 \
    -name "$VALHEIM_SERVER_NAME" \
    -port "$VALHEIM_SERVER_PORT" \
    -world "$VALHEIM_WORLD_NAME" \
    -password "$VALHEIM_SERVER_PASSWORD" \
    -savedir "/data/saves" \
    -public "${_IS_PUBLIC}"
