FROM golang:alpine as builder

ENV LEGO_VERSION 1.0.1

WORKDIR /go/src/github.com/xenolf/lego

RUN apk --update add git gawk && \
	git clone https://github.com/xenolf/lego.git . && \
	git checkout tags/v${LEGO_VERSION} && \
	go build -ldflags="-s -X main.version=${LEGO_VERSION}"



FROM tmacro/base:latest

ENV LEGO_PROVIDER cloudflare
ENV LEGO_DNS_RESOLVERS 8.8.8.8
ENV LEGO_PATH /lego
ENV LEGO_HOOKS_DIR $LEGO_PATH/hooks
ENV LEGO_KEY_TYPE ec384
ENV LEGO_RENEW_DAYS 30
ENV LEGO_ACME_HOST "https://acme-v02.api.letsencrypt.org/directory"
ENV	LEGO_ACME_STAGING_HOST "https://acme-staging-v02.api.letsencrypt.org/directory"
ENV LEGO_STAGING TRUE

RUN apk_add ca-certificates

COPY --from=builder /go/src/github.com/xenolf/lego/lego /usr/bin/lego
COPY ./issue-certs ./lego-config ./wait-grep /usr/bin/
RUN chmod +x /usr/bin/issue-certs /usr/bin/wait-grep && \
	mkdir -p $LEGO_HOOKS_DIR

COPY ./s6 /etc
COPY crontab /var/spool/cron/crontabs/root
# ENTRYPOINT /init
