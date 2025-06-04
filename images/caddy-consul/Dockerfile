FROM golang:alpine as builder

ARG XCADDY_VERSION=v0.4.4
ARG CADDY_VERSION=v2.10.0

RUN apk add --update git

# Install xcaddy

RUN go install github.com/caddyserver/xcaddy/cmd/xcaddy@${XCADDY_VERSION}

# Build caddy

RUN xcaddy build ${CADDY_VERSION} \
    --with github.com/tmacro/caddy-consul@v0.0.10-preview.2 \
    --with github.com/pteich/caddy-tlsconsul@v1.5.0 \
    --with github.com/caddy-dns/cloudflare@v0.2.1

FROM alpine

ENV XDG_DATA_HOME /data

ENV XDG_CONFIG_HOME /config

COPY --from=builder /go/caddy /usr/bin/caddy

ENTRYPOINT ["/usr/bin/caddy"]

CMD ["run"]
