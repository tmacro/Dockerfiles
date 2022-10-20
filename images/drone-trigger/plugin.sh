#!/bin/sh

curl \
    -X POST \
    -G \
    -H "Authorization: Bearer ${PLUGIN_TOKEN}" \
    --data-urlencode "branch=${PLUGIN_BRANCH}" \
    --data-urlencode "UPSTREAM_REPO=${DRONE_REPO}" \
    --data-urlencode "UPSTREAM_COMMIT_MESSAGE=${DRONE_COMMIT_MESSAGE}" \
    --data-urlencode "UPSTREAM_COMMIT_AUTHOR=${DRONE_COMMIT_AUTHOR}" \
    --data-urlencode "${PLUGIN_PARAM}" \
    ${PLUGIN_SERVER}/api/repos/${PLUGIN_REPO}/builds
