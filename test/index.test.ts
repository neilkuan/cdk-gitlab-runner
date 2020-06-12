import { GitlabContainerRunner } from '../lib/index';
import { App, Stack } from '@aws-cdk/core';
import '@aws-cdk/assert/jest';
import { InstanceType, InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';


test('Create the Runner', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabContainerRunner(stack, 'testing-have-type-tag', { gitlabtoken: 'GITLABTOKEN', tag1: 'aa', tag2: 'bb', tag3: 'cc' });
  expect(stack).toHaveResource('AWS::EC2::Instance');
  new GitlabContainerRunner(stack, 'testing-have-type', { gitlabtoken: 'GITLABTOKEN', ec2type: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO) });
  expect(stack).toHaveResource('AWS::EC2::Instance');
  new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLABTOKEN' });
  expect(stack).toHaveResource('AWS::EC2::Instance');
});