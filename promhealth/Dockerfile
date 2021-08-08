FROM tmacro/base:1.0.0

ENV EXPORTER_PORT 9213

ADD package.json yarn.lock /usr/local/src/exporter/

WORKDIR /usr/local/src/exporter/

RUN apk add --no-cache nodejs yarn \
    && yarn install --prod --frozen-lockfile

ADD ./s6 /etc

ADD exporter.js .
