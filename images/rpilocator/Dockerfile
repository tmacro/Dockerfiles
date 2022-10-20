FROM python:3

ADD requirements.txt /

RUN pip install -r /requirements.txt

ADD feed-watcher.py /

CMD python feed-watcher.py
