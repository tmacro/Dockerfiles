
FROM warp10io/warp10:2.9.0

# Override baked in version
# Remove when updating to a numbered release
# ENV WARP10_VERSION 2.8.1-95-g73e7de80

ENV S6_VERSION 2.0.0.1
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS 2

ENV WARP10_CONF_TEMPLATES ${WARP10_HOME}/conf.templates/standalone

# Modify Warp 10 default config
ENV standalone.host 0.0.0.0
ENV standalone.port 4802
ENV standalone.home /opt/warp10
ENV warpscript.repository.directory /usr/local/share/warpscript
ENV warp.token.file /static.tokens
ENV warpscript.extension.debug io.warp10.script.ext.debug.DebugWarpScriptExtension
ENV warpscript.maxops 100000000
RUN wget https://github.com/just-containers/s6-overlay/releases/download/v${S6_VERSION}/s6-overlay-amd64.tar.gz -O /tmp/s6-overlay-amd64.tar.gz \
    && tar xzf /tmp/s6-overlay-amd64.tar.gz -C / \
    && rm -rf /tmp/s6-overlay-amd64.tar.gz

ADD ./s6 /etc
ADD ./warpscript /usr/local/share/warpscript
ADD ./static.tokens /

CMD /init

