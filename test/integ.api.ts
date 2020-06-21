import { GitlabContainerRunner } from '../lib/index';
import { App, Stack, CfnOutput } from '@aws-cdk/core';
import { InstanceType, InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

const mockApp = new App();
const stack = new Stack(mockApp, 'testing-stack');

const runner = new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN', ec2type: InstanceType.of(InstanceClass.T3, InstanceSize.SMALL) });
runner.runnerrole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'));
new CfnOutput(stack, 'role', { value: runner.runnerrole.roleArn })