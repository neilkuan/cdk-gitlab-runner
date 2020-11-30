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
const runner = new GitlabRunnerAutoscaling(stack, 'TestRunnerAutoscaling', {
  gitlabToken: stack.node.tryGetContext('GITLAB_TOKEN'),
  ebsSize: 30,
  vpc: vpc,
  dockerVolumes: [{
    hostPath: '/tmp/cache',
    containerPath: '/tmp/cache',
  }],
  instanceType: 't3.large',
  desiredCapacity: 1,
  maxCapacity: 1,
  minCapacity: 1,
  spotInstance: true,
});
runner.securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
runner.securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));
new CfnOutput(stack, 'role', { value: runner.instanceRole.roleArn });
