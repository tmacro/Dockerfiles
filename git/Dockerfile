FROM alpine

RUN apk add --update --no-cache git

ADD credential-helper enable-credential-helper /usr/local/bin/

ENTRYPOINT ["git"]
