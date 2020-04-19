FROM tmacro/base
ENV DOCKERGEN_VER 0.7.4

ADD https://github.com/jwilder/docker-gen/releases/download/${DOCKERGEN_VER}/docker-gen-alpine-linux-amd64-${DOCKERGEN_VER}.tar.gz /tmp

RUN apk_add haproxy \
    && tar -C /usr/bin -xvzf /tmp/docker-gen-alpine-linux-amd64-${DOCKERGEN_VER}.tar.gz \
    && mkdir -p /etc/haproxy/certs.d

ADD ./s6 /etc
ADD ./scripts/reload-haproxy /usr/bin/
ADD ./templates/haproxy.cfg.tmpl /etc/haproxy/haproxy.cfg.tmpl
ADD ./scripts/503.http /etc/haproxy/503.http
