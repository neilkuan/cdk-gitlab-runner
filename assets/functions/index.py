import boto3
import time

ec2 = boto3.client('ec2')


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
    props = event["ResourceProperties"]
    spotfleet_request_id = props['SpotFleetRequestId']
    physical_id = 'describeInstances-{}'.format(spotfleet_request_id)
    print("create new resource with props %s" % props)
    data = {}
    while True:
        result = ec2.describe_spot_fleet_instances(
            SpotFleetRequestId=spotfleet_request_id)
        print(result)
        if 'ActiveInstances' in result and len(result['ActiveInstances']) > 0:
            data = {
                'InstanceId': result['ActiveInstances'][0]['InstanceId'],
                'InstanceType': result['ActiveInstances'][0]['InstanceType'],
                'SpotInstanceRequestId': result['ActiveInstances'][0]['SpotInstanceRequestId']
            }
            break
        else:
            time.sleep(3)
            continue
    return {'PhysicalResourceId': physical_id, 'Data': data}


def on_update(event):
    return on_create(event)


def on_delete(event):
    return


def is_complete(event, context):
    # physical_id = event["PhysicalResourceId"]
    request_type = event["RequestType"]
    props = event["ResourceProperties"]
    # already returns true on delete
    if request_type == 'Delete':
        return {'IsComplete': True}
    spot_fleet_request_id = props['SpotFleetRequestId']
    result = ec2.describe_spot_fleet_instances(
        SpotFleetRequestId=spot_fleet_request_id)
    print(result)
    is_ready = 'ActiveInstances' in result and len(
        result['ActiveInstances']) > 0
    return {'IsComplete': is_ready}
