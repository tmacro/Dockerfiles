FROM alpine:3.20.3

RUN apk add --update --no-cache dhcp

RUN touch /var/lib/dhcp/dhcpd.leases

CMD ["/usr/sbin/dhcpd", "-4", "-f", "-d", "--no-pid", "-cf", "/etc/dhcp/dhcpd.conf"]
