import { Vpc } from '@aws-cdk/aws-ec2';
import { App, Stack, CfnOutput } from '@aws-cdk/core';
import { GitlabRunnerAutoscaling } from './gitlab-runner-autoscaling';

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const app = new App();
const stack = new Stack(app, 'TestStackAutoscaling', { env });

const vpc = Vpc.fromLookup(stack, 'DefaultVpc', {
  isDefault: true,
});
const runner = new GitlabRunnerAutoscaling(stack, 'TestRunnerAutoscaling', {
  gitlabToken: stack.node.tryGetContext('GITLAB_TOKEN'),
  ebsSize: 10,
  vpc: vpc,
  dockerVolumes: [{
    hostPath: '/tmp/cache',
    containerPath: '/tmp/cache',
  }],
  desiredCapacity: 1,
  maxCapacity: 1,
  minCapacity: 1,
});

new CfnOutput(stack, 'role', { value: runner.instanceRole.roleArn });
