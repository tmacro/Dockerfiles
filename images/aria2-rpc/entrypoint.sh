#!/bin/sh

if [ -n "$ON_START" ]; then
    sh -c "$ON_START"
fi

FLAGS="-d $DOWNLOAD_DIR
    -j $PARALLEL_DOWNLOADS
    --enable-rpc
    --rpc-listen-all
    --rpc-listen-port $RPC_PORT
    --rpc-secret $RPC_SECRET
    --disable-ipv6
    --rpc-allow-origin-all
    --always-resume
    --show-console-readout false $@"

if [ -n "$ON_DOWNLOAD_START" ]; then
    FLAGS="$FLAGS --on-download-start $ON_DOWNLOAD_START"
fi

if [ -n "$ON_DOWNLOAD_COMPLETE" ]; then
    FLAGS="$FLAGS --on-download-complete $ON_DOWNLOAD_COMPLETE"
fi

if [ -n "$ON_DOWNLOAD_ERROR" ]; then
    FLAGS="$FLAGS --on-download-error $ON_DOWNLOAD_ERROR"
fi

echo $FLAGS

exec /usr/bin/aria2c $FLAGS
