
FROM tmacro/base:1.0.0

ENV EXPORTER_PORT 9213

ADD package.json yarn.lock /usr/local/src/exporter/

WORKDIR /usr/local/src/exporter/

RUN apk add --no-cache nodejs yarn \
    && yarn install --prod --frozen-lockfile

ADD exporter.js .

ADD ./s6 /etc

# RUN apk add --update -t build-deps go git libc-dev gcc libgcc \
#     && mkdir -p ${SRCPATH} \
#     && cd ${SRCPATH} \
#     && git clone ${SRCREPO} ${SRCPATH} \
#     && go get -d \
#     && go build -o /usr/local/bin/webhook

# FROM tmacro/base:1.0.0

# COPY --from=builder /usr/local/bin/webhook /usr/local/bin/webhook


EXPOSE 9213

# ENTRYPOINT  ["/usr/local/bin/webhook"]
