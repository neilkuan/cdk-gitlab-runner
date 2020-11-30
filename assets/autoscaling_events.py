import boto3
import logging
import json

autoscaling = boto3.client('autoscaling')
ssm = boto3.client('ssm')

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def send_unregister_command(instance_ids):
    logger.info(f"Unregistering gitlab runner: {instance_ids}")
    ssm.send_command(
        InstanceIds=instance_ids,
        DocumentName='AWS-RunShellScript',
        Parameters={
            # see - https://docs.gitlab.com/runner/commands/#gitlab-runner-unregister
            'commands': ['docker exec gitlab-runner gitlab-runner unregister --all-runners']
        }
    )


def unregister(event, context):
    logger.debug(event)

    for record in event['Records']:
        instance_id = json.loads(record['Sns']['Message'])['EC2InstanceId']
        send_unregister_command([instance_id])



def on_event(event, context):
    logger.debug(event)

    request_type = event['RequestType']
    if request_type == 'Delete':
        return on_delete(event)


def on_delete(event):
    props = event['ResourceProperties']
    auto_scaling_groups = autoscaling.describe_auto_scaling_groups(
        AutoScalingGroupNames=props['AutoScalingGroupNames']
    )

    logger.debug(auto_scaling_groups)

    for group in auto_scaling_groups['AutoScalingGroups']:
        instance_ids = [i['InstanceId'] for i in group['Instances']]
        send_unregister_command(instance_ids)
