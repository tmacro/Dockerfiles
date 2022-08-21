FROM prom/prometheus:v2.28.1 as prom

FROM alpine:latest

COPY --from=prom /bin/prometheus /bin/prometheus
COPY --from=prom /bin/promtool /bin/promtool
COPY --from=prom /etc/prometheus/prometheus.yml /etc/prometheus/prometheus.yml
COPY --from=prom /usr/share/prometheus/console_libraries/ /usr/share/prometheus/console_libraries/
COPY --from=prom /usr/share/prometheus/consoles/ /usr/share/prometheus/consoles/
COPY --from=prom /LICENSE /usr/share/prometheus/LICENSE
COPY --from=prom /NOTICE /usr/share/prometheus/NOTICE
COPY --from=prom /npm_licenses.tar.bz2 /usr/share/prometheus/npm_licenses.tar.bz2

RUN ln -s /usr/share/prometheus/console_libraries /usr/share/prometheus/consoles/ /etc/prometheus/

RUN mkdir -p /prometheus && \
    chown -R nobody:nobody /etc/prometheus /prometheus

ENV DOCKERGEN_VER 0.9.0

RUN wget https://github.com/jwilder/docker-gen/releases/download/${DOCKERGEN_VER}/docker-gen-alpine-linux-amd64-${DOCKERGEN_VER}.tar.gz -O /tmp/dockergen.tar.gz \
    && tar -C /usr/bin -xvzf /tmp/dockergen.tar.gz \
    && rm /tmp/dockergen.tar.gz

RUN apk add --update --no-cache python3 py3-pip curl git \
    && pip install supervisor jam-tool[yaml]

# RUN git clone https://github.com/tmacro/jam  /usr/local/src/jam \
#     && pip install /usr/local/src/jam[yaml]

ADD supervisord.conf /

ADD stub.yaml prometheus.yaml.tmpl /etc/prometheus/

ADD ./bin /usr/local/bin/

RUN chmod +x /usr/local/bin/prometheus-wrapper.sh /usr/local/bin/reload-prom.sh /usr/local/bin/prom-healthcheck.sh

HEALTHCHECK --interval=30s --timeout=3s CMD /usr/local/bin/prom-healthcheck.sh

CMD /usr/bin/supervisord -c /supervisord.conf
