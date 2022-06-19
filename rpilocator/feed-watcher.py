import requests
import feedparser
import time
import os
import sys
from datetime import datetime

DEFAULT_DEBUG = False
DEBUG = os.environ.get('DEBUG', DEFAULT_DEBUG) is not False

def now():
    return datetime.now().isoformat()

def log(msg):
    print(f'{now()} {msg}', flush=True)

def debug(msg):
    if DEBUG:
        log(f'[DEBUG] {msg}')

def fatal(msg, code=1):
    log(f'[FATAL] {msg}')
    sys.exit(code)

# Script version
VERSION = '1.1.0'

# User agent for feedparser
DEFAULT_USER_AGENT = f'tmacs.cloud/rpilocator:{VERSION}'
USER_AGENT = os.environ.get('USER_AGENT', DEFAULT_USER_AGENT)

# Notification message title
DEFAULT_MESSAGE_TITLE = 'RPi Stock Alert'
MESSAGE_TITLE = os.environ.get('MESSAGE_TITLE', DEFAULT_MESSAGE_TITLE)

# Feed URL
DEFAULT_FEED_URL = 'https://rpilocator.com/feed/'
FEED_URL = os.environ.get('FEED_URL', DEFAULT_FEED_URL)

# Pushover user key
PUSHOVER_USER_KEY = os.environ.get('PUSHOVER_USER_KEY')
if PUSHOVER_USER_KEY is None:
    fatal('PUSHOVER_USER_KEY is not defined.')

# Pushover application API key
PUSHOVER_API_KEY = os.environ.get('PUSHOVER_API_KEY')
if PUSHOVER_API_KEY is None:
    fatal('PUSHOVER_API_KEY is not defined.')

_auth_params = f'token={PUSHOVER_API_KEY}&user={PUSHOVER_USER_KEY}&title={MESSAGE_TITLE}'
def formatMessage(entry):
    return f'{_auth_params}&message={entry.title}&url={entry.link}'

# Send the push/message to all devices connected to Pushover
def sendMessage(message):
    try:
        req = requests.post(url='https://api.pushover.net/1/messages.json', data=message, timeout=20)
    except requests.exceptions.Timeout:
        log('Request Timeout')
        pass
    except requests.exceptions.TooManyRedirects:
        log('Too many requests')
        pass
    except requests.exceptions.RequestException as e:
        log(e)
        pass

def get_feed():
    f = feedparser.parse(FEED_URL, agent=USER_AGENT)
    if f.entries:
        for entry in f.entries:
            yield entry

log(f'Starting rpilocator watcher v{VERSION}.')
log(f'Using FEED_URL => {FEED_URL}')
log(f'Using USER_AGENT => {USER_AGENT}')

log('Populating existing entries.')
seen_entries = []
for entry in get_feed():
    debug(f'Adding existing entry {entry.id}.')
    seen_entries.append(entry.id)

if len(seen_entries) == 0:
    log('No existing entries found.')

log('Done populating existing entries. Sleeping 30 seconds.')
time.sleep(30)

log('Starting refresh loop.')
while True:
    log('Refreshing feed.')
    found_new = False
    for entry in get_feed():
        if entry.id not in seen_entries:
            log(f'Got new entry {entry.id}.')
            message = formatMessage(entry)
            sendMessage(message)
            seen_entries.append(entry.id)
            found_new = True
    if not found_new:
        debug('No new entries found.')
    time.sleep(59)
