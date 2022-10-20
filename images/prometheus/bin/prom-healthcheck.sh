#!/bin/sh

set -ex

exec curl localhost:9090/-/healthy
