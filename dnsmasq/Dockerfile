FROM alpine:3.15.4

RUN apk add dnsmasq-dnssec

ADD ./dnsmasq.conf /etc/dnsmasq.conf

CMD dnsmasq --conf-file=/etc/dnsmasq.conf
