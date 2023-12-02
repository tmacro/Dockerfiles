FROM golang:alpine as builder

ARG XCADDY_VERSION=v0.3.5
ARG CADDY_VERSION=v2.7.5
ARG CADDY_DOCKER_PROXY_VERSION=v2.8.10

RUN apk add --update git

# Install xcaddy

RUN go install github.com/caddyserver/xcaddy/cmd/xcaddy@${XCADDY_VERSION}

# Build caddy

RUN xcaddy build ${CADDY_VERSION} \
    --with github.com/caddy-dns/cloudflare \
    --with github.com/lucaslorentz/caddy-docker-proxy/v2@${CADDY_DOCKER_PROXY_VERSION}

FROM alpine

ENV XDG_DATA_HOME /data

ENV XDG_CONFIG_HOME /config

COPY --from=builder /go/caddy /usr/bin/caddy

ENTRYPOINT ["/usr/bin/caddy"]

CMD ["run"]
