#!/busybox/sh

set -euo pipefail

export PATH=$PATH:/kaniko/

REGISTRY=${PLUGIN_REGISTRY-docker.io}
DOCKERFILE=${PLUGIN_DOCKERFILE:-Dockerfile}
CONTEXT=${PLUGIN_CONTEXT:-$PWD}
LOG=${PLUGIN_LOG:-info}
EXTRA_OPTS=""

if [[ -n "${PLUGIN_TARGET:-}" ]]; then
    TARGET="--target=${PLUGIN_TARGET}"
fi

if [[ "${PLUGIN_SKIP_TLS_VERIFY:-}" == "true" ]]; then
    EXTRA_OPTS="--skip-tls-verify=true"
fi

if [[ "${PLUGIN_CACHE:-}" == "true" ]]; then
    CACHE="--cache=true"
fi

if [ -n "${PLUGIN_CACHE_REPO:-}" ]; then
    CACHE_REPO="--cache-repo=${REGISTRY}/${PLUGIN_CACHE_REPO}"
fi

if [ -n "${PLUGIN_CACHE_TTL:-}" ]; then
    CACHE_TTL="--cache-ttl=${PLUGIN_CACHE_TTL}"
fi

if [ -n "${PLUGIN_BUILD_ARGS:-}" ]; then
    BUILD_ARGS=$(echo "${PLUGIN_BUILD_ARGS}" | tr ',' '\n' | while read build_arg; do echo "--build-arg=${build_arg}"; done)
fi

if [ -n "${PLUGIN_BUILD_ARGS_FROM_ENV:-}" ]; then
    BUILD_ARGS_FROM_ENV=$(echo "${PLUGIN_BUILD_ARGS_FROM_ENV}" | tr ',' '\n' | while read build_arg; do echo "--build-arg ${build_arg}=$(eval "echo \$$build_arg")"; done)
fi

# auto_tag, if set auto_tag: true, auto generate .tags file
# support format Major.Minor.Release or start with `v`
# docker tags: Major, Major.Minor, Major.Minor.Release and latest
if [[ "${PLUGIN_AUTO_TAG:-}" == "true" ]]; then
    TAG=$(echo "${DRONE_TAG:-}" |sed 's/^v//g')
    part=$(echo "${TAG}" |tr '.' '\n' |wc -l)
    # expect number
    echo ${TAG} |grep -E "[a-z-]" &>/dev/null && isNum=1 || isNum=0

    if [ ! -n "${TAG:-}" ];then
        echo "latest" > .tags
    elif [ ${isNum} -eq 1 -o ${part} -gt 3 ];then
        echo "${TAG},latest" > .tags
    else
        major=$(echo "${TAG}" |awk -F'.' '{print $1}')
        minor=$(echo "${TAG}" |awk -F'.' '{print $2}')
        release=$(echo "${TAG}" |awk -F'.' '{print $3}')

        major=${major:-0}
        minor=${minor:-0}
        release=${release:-0}

        echo "${major},${major}.${minor},${major}.${minor}.${release},latest" > .tags
    fi
fi

if [ -n "${PLUGIN_TAGS:-}" ]; then
    DESTINATIONS=$(echo "${PLUGIN_TAGS}" | tr ',' '\n' | while read tag; do echo "--destination=${REGISTRY}/${PLUGIN_REPO}/${PLUGIN_IMAGE}:${tag} "; done)
elif [ -f .tags ]; then
    DESTINATIONS=$(cat .tags| tr ',' '\n' | while read tag; do echo "--destination=${REGISTRY}/${PLUGIN_REPO}/${PLUGIN_IMAGE}:${tag} "; done)
elif [ -n "${PLUGIN_REPO:-}" ]; then
    DESTINATIONS="--destination=${REGISTRY}/${PLUGIN_REPO}/${PLUGIN_IMAGE}:latest"
else
    DESTINATIONS="--no-push"
    # Cache is not valid with --no-push
    CACHE=""
fi

# Write credentials file
/usr/local/bin/credential-helper /kaniko/.docker/config.json

FLAGS="-v ${LOG} \
    --context=${CONTEXT} \
    --dockerfile=${DOCKERFILE} \
    ${EXTRA_OPTS} \
    ${DESTINATIONS} \
    ${CACHE:-} \
    ${CACHE_TTL:-} \
    ${CACHE_REPO:-} \
    ${TARGET:-} \
    ${BUILD_ARGS:-} \
    ${BUILD_ARGS_FROM_ENV:-}"

echo "/kaniko/executor $FLAGS"

exec /kaniko/executor $FLAGS
