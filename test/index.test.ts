import { GitlabContainerRunner } from '../lib/index';
import { App, Stack } from '@aws-cdk/core';
import '@aws-cdk/assert/jest';

test('create the Runner', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');

  new GitlabContainerRunner(stack, 'testing', { gitlabtoken: "apple" });

  expect(stack).toHaveResource('AWS::EC2::Instance', {
    Tags: 'Name',
  });
});



