FROM tmacro/base:latest

RUN apk_add python3 && \
	echo -e '#!/bin/sh\npython3 -m pip "$@"' > /usr/bin/pip  && \
	chmod +x /usr/bin/pip && \
	ln -s /usr/bin/python3 /usr/bin/python