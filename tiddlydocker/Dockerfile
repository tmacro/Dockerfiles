FROM node:alpine
ENV S6_VERSION 1.21.7.0

ENV TIDDLYWIKI_USER tmac
ENV TIDDLYWIKI_PASSWD str0ng_passw0rd
ENV TIDDLYWIKI_NAME Notes
ENV TIDDLYWIKI_PORT 8080
ENV TIDDLYWIKI_DIR /tiddlywiki
# add apk_add convienence script

# Install s6-overlay
ADD https://github.com/just-containers/s6-overlay/releases/download/v$S6_VERSION/s6-overlay-amd64.tar.gz /tmp/
RUN tar xzf /tmp/s6-overlay-amd64.tar.gz -C / && rm /tmp/s6-overlay-amd64.tar.gz


RUN npm install -g tiddlywiki && \
	mkdir -p /${TIDDLYWIKI_DIR}/${TIDDLYWIKI_NAME}

ADD ./s6 /etc

CMD ["/init"]
