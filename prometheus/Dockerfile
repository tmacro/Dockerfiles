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

RUN apk add --update --no-cache python3 py3-pip \
    && pip install supervisor

ADD supervisord.conf /

ADD ./prometheus.yaml.tmpl /

ADD ./prometheus-wrapper ./reload-prom /usr/local/bin/

RUN chmod +x /usr/local/bin//prometheus-wrapper /usr/local/bin/reload-prom

CMD /usr/bin/supervisord -c /supervisord.conf

# HEALTHCHECK --interval=30s --timeout=3s --start-period=1m CMD /app/healthcheck.sh
