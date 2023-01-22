FROM golang:alpine as builder

ENV WEBHOOK_VERSION 2.8.0

RUN apk add git

WORKDIR /build

RUN git clone https://github.com/adnanh/webhook.git /build \
    && git checkout $WEBHOOK_VERSION

RUN CGO_ENABLED=0 GOOS=linux go build -tags netgo -ldflags '-w'



FROM alpine:latest

ENV TINI_VERSION v0.19.0

ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini

RUN chmod +x /tini

COPY --from=builder /build/webhook /usr/bin/webhook

ENTRYPOINT ["/tini", "--"]

CMD ["/usr/bin/webhook", "-verbose", "-hooks", "/hooks/hooks.yaml"]
