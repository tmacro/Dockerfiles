FROM gcr.io/kaniko-project/executor:v1.9.0-debug

ENV HOME /root

ENV USER root

ENV SSL_CERT_DIR=/kaniko/ssl/certs

# ENV DOCKER_CONFIG /kaniko/.docker/
# ENV DOCKER_CREDENTIAL_GCR_CONFIG /kaniko/.config/gcloud/docker_credential_gcr_config.json

ADD ./bin /usr/local/bin

RUN chmod -R 555 /usr/local/bin/

ENTRYPOINT [ "/usr/local/bin/plugin.sh" ]
