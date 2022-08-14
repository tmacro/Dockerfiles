FROM authelia/authelia:latest

ENV DOCKERGEN_VER 0.9.0

RUN wget https://github.com/jwilder/docker-gen/releases/download/${DOCKERGEN_VER}/docker-gen-alpine-linux-amd64-${DOCKERGEN_VER}.tar.gz -O /tmp/dockergen.tar.gz \
    && tar -C /usr/bin -xvzf /tmp/dockergen.tar.gz \
    && rm /tmp/dockergen.tar.gz

RUN apk add --update --no-cache python3 py3-pip \
    && pip install supervisor pyyaml

ADD yam apply-config start-authelia /usr/local/bin/

ADD supervisord.conf /

ADD base.yaml acl.yaml.tmpl /etc/authelia/

CMD /usr/bin/supervisord -c /supervisord.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=1m CMD /app/healthcheck.sh
