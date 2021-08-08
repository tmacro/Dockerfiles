FROM prom/prometheus:v2.28.1 as prom

FROM tmacro/base:1.0.0

ENV DOCKERGEN_VERSION 0.7.7
ENV CURL_VERSION 7.78.0

COPY --from=prom /bin/prometheus /bin/prometheus
COPY --from=prom /bin/promtool /bin/promtool
COPY --from=prom /etc/prometheus/prometheus.yml /etc/prometheus/prometheus.yml
COPY --from=prom /usr/share/prometheus/console_libraries/ /usr/share/prometheus/console_libraries/
COPY --from=prom /usr/share/prometheus/consoles/ /usr/share/prometheus/consoles/
COPY --from=prom /LICENSE /usr/share/prometheus/LICENSE
COPY --from=prom /NOTICE /usr/share/prometheus/NOTICE
COPY --from=prom /npm_licenses.tar.bz2 /usr/share/prometheus/npm_licenses.tar.bz2

RUN wget https://github.com/nginx-proxy/docker-gen/releases/download/${DOCKERGEN_VERSION}/docker-gen-linux-amd64-${DOCKERGEN_VERSION}.tar.gz \
    && tar xvzf docker-gen-linux-amd64-${DOCKERGEN_VERSION}.tar.gz -C /bin/ \
    && wget https://github.com/moparisthebest/static-curl/releases/download/v${CURL_VERSION}/curl-amd64 -O /bin/curl \
    && chmod +x /bin/curl

RUN ln -s /usr/share/prometheus/console_libraries /usr/share/prometheus/consoles/ /etc/prometheus/
RUN mkdir -p /prometheus && \
    chown -R nobody:nobody etc/prometheus /prometheus

ADD ./s6 /etc
ADD ./prometheus.yaml.tmpl /
