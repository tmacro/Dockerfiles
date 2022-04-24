FROM alpine:3.15.4

RUN apk add dnsmasq-dnssec

ADD ./dnsmasq.conf /etc/dnsmasq.conf
ADD ./docker-entrypoint.sh /

CMD /docker-entrypoint.sh
