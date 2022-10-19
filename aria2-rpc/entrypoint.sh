#!/bin/sh

FLAGS="-d $DOWNLOAD_DIR
    -j $PARALLEL_DOWNLOADS
    --enable-rpc
    --rpc-listen-all
    --rpc-listen-port $RPC_PORT
    --rpc-secret $RPC_SECRET
    --disable-ipv6
    --rpc-allow-origin-all
    --show-console-readout false $@"

echo $FLAGS

exec /usr/bin/aria2c $FLAGS
