import { GitlabContainerRunner } from '../lib/index';
import { App, Stack, CfnOutput } from '@aws-cdk/core';
import { Port, Peer } from '@aws-cdk/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam';

const mockApp = new App();
const stack = new Stack(mockApp, 'testing-stack');
const role = new Role(stack, 'runner-role', {
  assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
  description: 'For Gitlab EC2 Runner Test Role',
  roleName: 'TestRole',
});
const runner = new GitlabContainerRunner(stack, 'testing', {
  gitlabtoken: 'GITLAB_TOKEN',
  ec2type: 't3.small',
  ec2iamrole: role,
  gitlaburl: 'https://gitlab.com/',
  ebsSize: 100,
});
runner.runnerRole.addManagedPolicy(
  ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
);
runner.runnerEc2.connections.allowFrom(Peer.ipv4('0.0.0.0/0'), Port.tcp(80));
runner.runnerEc2.connections.allowFrom(Peer.ipv4('0.0.0.0/0'), Port.tcp(443));
new CfnOutput(stack, 'role', { value: runner.runnerRole.roleArn });
new CfnOutput(stack, 'InstanceID', { value: runner.runnerEc2.instanceId });
