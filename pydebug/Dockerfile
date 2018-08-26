FROM debian:latest

ENV PY_VERSION 3.6.4

ADD https://www.python.org/ftp/python/${PY_VERSION}/Python-${PY_VERSION}.tgz /tmp/Python-${PY_VERSION}.tar.gz

RUN apt-get update &&  apt-get install -y build-essential valgrind zlib1g-dev libssl-dev
RUN cd /tmp \
    && tar xvzf Python-${PY_VERSION}.tar.gz \
    && cd Python-${PY_VERSION} \
    && ./configure --without-pymalloc --with-pydebug --with-zlib\
    && make -j 7 \
    && make install \
    && ln -s /usr/local/bin/python3 /usr/local/bin/python \
    && ln -s /usr/local/bin/pip3 /usr/local/bin/pip