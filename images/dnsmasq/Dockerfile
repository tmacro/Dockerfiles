FROM alpine:3.20.2

RUN apk add dnsmasq-dnssec

ADD ./dnsmasq.conf /etc/dnsmasq.conf
ADD ./docker-entrypoint.sh /

CMD /docker-entrypoint.sh
