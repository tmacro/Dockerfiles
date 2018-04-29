FROM library/nextcloud:13-fpm-alpine

ENV S6_VERSION 1.11.0.1

# Install s6-overlay
ADD https://github.com/just-containers/s6-overlay/releases/download/v$S6_VERSION/s6-overlay-amd64.tar.gz /tmp/
RUN tar xzf /tmp/s6-overlay-amd64.tar.gz -C / && rm /tmp/s6-overlay-amd64.tar.gz \
    && apk add --update nginx \
    && mkdir -p /run/nginx

ADD ./nginx.conf /etc/nginx/nginx.conf
ADD ./s6 /etc

ENTRYPOINT [ "/init" ]