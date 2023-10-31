FROM python:3.10-alpine

RUN wget https://xyne.dev/projects/reflector/src/reflector-2023.tar.xz \
    && tar -xf reflector-2023.tar.xz \
    && cd reflector-2023 \
    && python setup.py install \
    && cd .. \
    && rm -rf reflector-2023.tar.xz reflector-2023

ADD refresh-mirrors.sh /usr/local/bin/refresh-mirrors.sh

RUN chmod +x /usr/local/bin/refresh-mirrors.sh

ENTRYPOINT ["reflector"]
