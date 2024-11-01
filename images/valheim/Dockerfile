######## INSTALL ########

# Set the base image
FROM steamcmd/steamcmd:ubuntu-24

# Add entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh

ENV VALHEIM_SERVER_NAME="Valheim Server"
ENV VALHEIM_WORLD_NAME="Dedicated"
ENV VALHEIM_SERVER_PORT=2456

# Set default command
ENTRYPOINT ["/docker-entrypoint.sh"]
