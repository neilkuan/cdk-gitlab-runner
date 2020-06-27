import { GitlabContainerRunner } from '../lib/index';
import { App, Stack, CfnOutput } from '@aws-cdk/core';
import { InstanceType, InstanceClass, InstanceSize, Port, Peer, Vpc, SubnetType } from '@aws-cdk/aws-ec2';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

const mockApp = new App();
const stack = new Stack(mockApp, 'testing-stack');
const newvpc = new Vpc(stack, 'VPC', {
  cidr: '10.1.0.0/16',
  maxAzs: 2,
  subnetConfiguration: [{
    cidrMask: 26,
    name: 'RunnerVPC',
    subnetType: SubnetType.PUBLIC,
  }],
  natGateways: 0,
});

const runner = new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN', ec2type: InstanceType.of(InstanceClass.T3, InstanceSize.SMALL), selfvpc: newvpc });
runner.runnerRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'));
runner.runnerEc2.connections.allowFrom(Peer.ipv4('0.0.0.0/0'), Port.tcp(80));
new CfnOutput(stack, 'role', { value: runner.runnerRole.roleArn })
new CfnOutput(stack, 'InstanceID', { value: runner.runnerEc2.instanceId })