import boto3
import urllib.request
import urllib.parse
from urllib.error import URLError, HTTPError
import logging
import json

def check_token():
    with open('/tmp/runnertoken.txt', 'r') as token_file:
        token = token_file.read()
        return token

def slash_or_not_slash(url):
    try: 
      aftercut = url.split('/')
      if not aftercut[-1]:
        print ('url is https://gitlab.com/')
        return url
      else:
        print ('url is https://gitlab.com will add / and then return')
        return url +'/'
    except: 
      pass

def on_event(event, context):
    print(event)
    request_type = event['RequestType']
    if request_type == 'Create':
        return on_create(event)
    if request_type == 'Update':
        return on_update(event)
    if request_type == 'Delete':
        return on_delete(event)
    raise Exception("Invalid request type: %s" % request_type)


def on_create(event):
    print("[INFO]", "Create  Event")
    props = event["ResourceProperties"]
    print("update resource with props %s" % (props))
    output = {'Status': 'Created'}
    return output


def on_update(event):
    print("[INFO]", "Update Event")
    props = event["ResourceProperties"]
    print("update resource with props %s" % (props))
    output = {'Status': 'Updated'}
    return output


def on_delete(event):
    print("[INFO]", "Delete Event")
    props = event["ResourceProperties"]
    print("update resource with props %s" % (props))
    s3 = boto3.client('s3')
    s3.download_file(props['BucketName'], 'runnertoken.txt', '/tmp/runnertoken.txt')
    print("load runner file to json")
    tokenfile = json.loads(check_token())
    print("runner token to prepayload")
    prepayload = {'token': str(tokenfile['token'])}
    print("encode prepayload to payload")
    payload = urllib.parse.urlencode(prepayload).encode('utf8')
    req = urllib.request.Request(slash_or_not_slash(props['GitlabUrl'])+'api/v4/runners',data=payload ,method='DELETE' )
    print("run unregister runner")
    with urllib.request.urlopen(req) as res:
        print (res.read())
    output = {'Status': 'deleted'}
    return output


def is_complete(event):
    return {'IsComplete': True}
