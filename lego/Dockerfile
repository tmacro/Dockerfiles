FROM golang:alpine as builder

ENV LEGO_VERSION 2.6.0

WORKDIR /go/src/github.com/go-acme/lego

RUN apk --update add git gawk make && \
	git clone https://github.com/go-acme/lego.git . && \
	git checkout tags/v${LEGO_VERSION} && \
	make generate-dns build



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

COPY --from=builder /go/src/github.com/go-acme/lego/dist/lego /usr/bin/lego
COPY ./issue-certs ./lego-config ./wait-grep /usr/bin/
RUN chmod +x /usr/bin/issue-certs /usr/bin/wait-grep && \
	mkdir -p $LEGO_HOOKS_DIR

COPY ./s6 /etc
COPY crontab /var/spool/cron/crontabs/root
# ENTRYPOINT /init
