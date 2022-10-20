FROM tmacro/base
ENV DOCKERGEN_VER 0.7.4

ADD https://raw.githubusercontent.com/jcmoraisjr/haproxy-ingress/master/rootfs/usr/local/etc/haproxy/lua/auth-request.lua /etc/haproxy/lua/auth-request.lua

RUN wget https://github.com/jwilder/docker-gen/releases/download/${DOCKERGEN_VER}/docker-gen-alpine-linux-amd64-${DOCKERGEN_VER}.tar.gz -O /tmp/dockergen.tar.gz \
    && tar -C /usr/bin -xvzf /tmp/dockergen.tar.gz \
    && rm /tmp/dockergen.tar.gz

RUN apk_add haproxy openssl lua5.3 lua-socket rsyslog \
    && mkdir -p /etc/haproxy/certs.d \
    && mkdir -p /etc/rsyslog.d \
    && touch /var/log/haproxy.log \
    && ln -sf /dev/stdout /var/log/haproxy.log

ADD ./s6 /etc
ADD ./scripts/reload-haproxy /usr/bin/
ADD ./templates/haproxy.cfg.tmpl /etc/haproxy/haproxy.cfg.tmpl
ADD ./scripts/503.http /etc/haproxy/503.http
ADD ./rsyslog.conf /etc/rsyslog.d/