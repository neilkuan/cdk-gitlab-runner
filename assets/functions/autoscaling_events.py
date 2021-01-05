import os
import logging
import json

import boto3

autoscaling = boto3.client('autoscaling')
cloudwatch = boto3.client('cloudwatch')
ssm = boto3.client('ssm')

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def put_alarms(instance_id, alarms, topic_arns):
    logger.info(f'Putting alarms for the runner: {instance_id}')

    alarm_default_args = {
        'Namespace': 'GitlabRunner',
        'AlarmActions': topic_arns,
        'Statistic': 'Average',
        'Dimensions': [
            {
                'Name': 'InstanceId',
                'Value': instance_id
            },
            {
                'Name': 'path',
                'Value': '/'
            },
        ],
        'Period': 60,
        'Unit': 'Percent',
        'EvaluationPeriods': 1,
        'DatapointsToAlarm': 1,
        'Threshold': 75,
        'ComparisonOperator': 'GreaterThanOrEqualToThreshold',
        'TreatMissingData': 'ignore',
    }

    for alarm in alarms:
        cloudwatch.put_metric_alarm(**{
            **alarm_default_args,
            **alarm,
            **{'AlarmName': f'{alarm["AlarmName"]}-{instance_id}'},
        })


def delete_alarms(instance_id, alarms):
    logger.info(f'Deleting alarms for the runner: {instance_id}')

    alarm_names = [f'{alarm["AlarmName"]}-{instance_id}' for alarm in alarms]
    cloudwatch.delete_alarms(AlarmNames=alarm_names)


def send_unregister_command(instance_ids):
    logger.info(f'Unregistering gitlab runners: {instance_ids}')
    ssm.send_command(
        InstanceIds=instance_ids,
        DocumentName='AWS-RunShellScript',
        Parameters={
            # see - https://docs.gitlab.com/runner/commands/#gitlab-runner-unregister
            'commands': ['docker exec gitlab-runner gitlab-runner unregister --all-runners']
        }
    )


def register(event, context):
    logger.debug(event)
    alarms = json.loads(os.environ['ALARMS'])
    topic_arns = os.environ['SNS_TOPIC_ARN']

    for record in event['Records']:
        instance_id = json.loads(record['Sns']['Message'])['EC2InstanceId']
        put_alarms(instance_id, alarms, [topic_arns])


def unregister(event, context):
    logger.debug(event)
    alarms = json.loads(os.environ['ALARMS'])

    for record in event['Records']:
        instance_id = json.loads(record['Sns']['Message'])['EC2InstanceId']
        send_unregister_command([instance_id])
        delete_alarms(instance_id, alarms)


def on_alarm(event, context):
    logger.debug(event)

    for record in event['Records']:
        message = json.loads(record['Sns']['Message'])
        for dimension in message['Trigger']['Dimensions']:
            if dimension['name'] == 'InstanceId':
                instance_id = dimension['value']

                logger.info(f'Set instance status unhealthy: {instance_id}')

                autoscaling.set_instance_health(
                    InstanceId=instance_id,
                    HealthStatus='Unhealthy'
                )


def on_delete(event):
    logger.debug(event)
    alarms = json.loads(os.environ['ALARMS'])

    props = event['ResourceProperties']
    auto_scaling_groups = autoscaling.describe_auto_scaling_groups(
        AutoScalingGroupNames=props['AutoScalingGroupNames']
    )

    logger.debug(auto_scaling_groups)

    for group in auto_scaling_groups['AutoScalingGroups']:
        instance_ids = [i['InstanceId'] for i in group['Instances']]
        send_unregister_command(instance_ids)
        for instance_id in instance_ids:
            delete_alarms(instance_id, alarms)


def on_event(event, context):
    logger.debug(event)

    request_type = event['RequestType']
    if request_type == 'Delete':
        return on_delete(event)
