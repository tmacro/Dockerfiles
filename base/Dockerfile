FROM alpine:3.11.2
LABEL author Taylor McKinnon <mail@tmacs.space>

ENV S6_VERSION 2.2.0.3

# add apk_add convienence script
ADD ./apk_add /usr/bin/
RUN chmod +x /usr/bin/apk_add

# Install s6-overlay
RUN wget https://github.com/just-containers/s6-overlay/releases/download/v$S6_VERSION/s6-overlay-amd64.tar.gz -o /tmp/s6-overlay-amd64.tar.gz \
    && tar xzf /tmp/s6-overlay-amd64.tar.gz -C / \
    && rm /tmp/s6-overlay-amd64.tar.gz

CMD ["/init"]
