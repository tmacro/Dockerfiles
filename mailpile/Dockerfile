FROM alpine:3.10
MAINTAINER Rafael Römhild <rafael@roemhild.de>

ENV VERSION 1.0.0rc6
ENV TZ "America/Los_Angeles"
ENV MAILPILE_GNUPG/GA "/usr/bin/gpg-agent"
ENV MAILPILE_GNUPG/DM "/usr/bin/dirmngr"
ENV MAILPILE_TOR "/usr/bin/tor"
ENV MAILPILE_OPENSSL "/usr/bin/openssl"
ENV MAILPILE_GNUPG "/usr/bin/gpg"

# Install requirements
RUN apk add --update-cache \
        git \
        tor \
        zlib \
        gnupg \
        gnupg1 \
        py2-pip \
        openssl \
        py-jinja2 \
        py-libxml2 \
        py-libxslt \
        py-lxml \
        py-pbr \
        py-pillow \
        py-cffi \
        py-cryptography \
        ca-certificates

# Mailpile read timezone from server, so in docker-compose you can change TZ
RUN apk add --no-cache tzdata

RUN ln -sf "/usr/share/zoneinfo/$TZ" /etc/localtime && \
    echo "$TZ" > /etc/timezone && date

# Get Mailpile from github
RUN git clone https://github.com/mailpile/Mailpile.git \
        --branch $VERSION --single-branch --depth=1

WORKDIR /Mailpile

# Install missing requirements
RUN pip install -r requirements.txt

# Initial Mailpile setup
RUN ./mp setup

CMD ./mp --www=0.0.0.0:33411 --wait
EXPOSE 33411

VOLUME /root/.local/share/Mailpile
VOLUME /root/.gnupg

# FROM debian:stretch-slim

# ENV GID 33411
# ENV UID 33411

# RUN apt-get update && \
#     apt-get install -y curl apt-transport-https gnupg && \
#     curl -s https://packages.mailpile.is/deb/key.asc | apt-key add - && \
#     echo "deb https://packages.mailpile.is/deb release main" | tee /etc/apt/sources.list.d/000-mailpile.list && \
#     apt-get update && \
#     apt-get install -y mailpile && \
#     # TODO Enable apache for multi users
#     # apt-get install -y mailpile-apache2
#     update-rc.d tor defaults && \
#     service tor start && \
#     groupadd -g $GID mailpile && \
#     useradd -u $UID -g $GID -m mailpile && \
#     su - mailpile -c 'mailpile setup' && \
#     apt-get clean

# WORKDIR /home/mailpile
# USER mailpile

# VOLUME /home/mailpile/.local/share/Mailpile
# EXPOSE 33411

# CMD mailpile --www=0.0.0.0:33411/ --wait