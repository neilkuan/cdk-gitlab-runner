import * as asg from '@aws-cdk/aws-autoscaling';
import * as ec2 from '@aws-cdk/aws-ec2';
import { App, Stack, CfnOutput } from '@aws-cdk/core';
import { GitlabRunnerAutoscaling } from './gitlab-runner-autoscaling';

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const app = new App();
const stack = new Stack(app, 'TestStackAutoscaling', { env });

const vpc = ec2.Vpc.fromLookup(stack, 'DefaultVpc', {
  isDefault: true,
});
const defaultCapacity = parseInt(stack.node.tryGetContext('CAPACITY'));
const runner = new GitlabRunnerAutoscaling(stack, 'TestRunnerAutoscaling', {
  gitlabToken: stack.node.tryGetContext('GITLAB_TOKEN'),
  ebsSize: 10,
  vpc: vpc,
  dockerVolumes: [{
    hostPath: '/tmp/cache',
    containerPath: '/tmp/cache',
  }],
  minCapacity: defaultCapacity,
  maxCapacity: defaultCapacity,
  spotInstance: true,
  alarms: [
    {
      AlarmName: 'GitlabRunnerDiskUsage',
      MetricName: 'disk_used_percent',
      Threshold: 50,
    },
  ],
});

/**
 * Scheduled scaling
 * https://docs.aws.amazon.com/cdk/api/latest/docs/aws-autoscaling-readme.html#scheduled-scaling
 */
runner.autoscalingGroup.scaleOnSchedule('StopOnWeekends', {
  schedule: asg.Schedule.cron({ weekDay: 'fri', hour: '18', minute: '0' }),
  minCapacity: 0,
  maxCapacity: 0,
});

runner.autoscalingGroup.scaleOnSchedule('WorkOnWeekdays', {
  schedule: asg.Schedule.cron({ weekDay: 'mon', hour: '9', minute: '0' }),
  minCapacity: defaultCapacity,
  maxCapacity: defaultCapacity,
});


new CfnOutput(stack, 'role', { value: runner.instanceRole.roleArn });
