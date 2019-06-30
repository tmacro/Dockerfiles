FROM tmacro/lego
ENV DOCKERGEN_VER 0.7.4

ADD https://github.com/jwilder/docker-gen/releases/download/${DOCKERGEN_VER}/docker-gen-alpine-linux-amd64-${DOCKERGEN_VER}.tar.gz /tmp
ADD ./scripts/reload-haproxy ./scripts/install-certificates /usr/bin/

RUN apk_add haproxy \
    && tar -C /usr/bin -xvzf /tmp/docker-gen-alpine-linux-amd64-${DOCKERGEN_VER}.tar.gz \
    && mkdir -p /etc/haproxy/certs.d \
	&& chmod +x /usr/bin/install-certificates \
    && ln -s /usr/bin/install-certificates $LEGO_HOOKS_DIR/run \
    && ln -s /usr/bin/install-certificates $LEGO_HOOKS_DIR/renew

ADD ./s6 /etc
ADD ./templates/haproxy.cfg.tmpl /etc/haproxy/haproxy.cfg.tmpl
ADD ./scripts/503.http /etc/haproxy/503.http
