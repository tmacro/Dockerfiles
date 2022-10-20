FROM node:16-alpine as builder

ENV CLOUDSERVER_VER=8.4.12
ENV S3_CONFIG_FILE /etc/cloudserver/config.json
ENV S3METADATAPATH /var/lib/cloudserver/metadata
ENV S3DATAPATH /var/lib/cloudserver/data
ENV S3_LOCATION_FILE /etc/cloudserver/locations.json
ENV S3AUTH_CONFIG  /etc/cloudserver/auth.json
ENV REMOTE_MANAGEMENT_DISABLE true

RUN apk add git python3 make build-base

RUN git clone --branch ${CLOUDSERVER_VER} --depth 1 https://github.com/scality/cloudserver.git /usr/local/src/cloudserver

WORKDIR /usr/local/src/cloudserver

RUN yarn install --production --frozen-lockfile --network-concurrency 1 \
    && apk add --update --no-cache python3 py3-pip \
    && pip install supervisor \
    && mkdir -p \
        /etc/cloudserver \
        /var/lib/cloudserver/data \
        /var/lib/cloudserver/metadata

ADD supervisord.conf /

ADD ./overlay.json /etc/cloudserver/overlay.json

ADD ./jam ./start-cloudserver /usr/local/bin/


CMD /usr/bin/supervisord -c /supervisord.conf
