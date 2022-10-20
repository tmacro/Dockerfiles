FROM alpine:latest

RUN apk add --update --no-cache curl

ADD ./plugin.sh /

RUN chmod +x /plugin.sh

ENTRYPOINT ["/plugin.sh"]
