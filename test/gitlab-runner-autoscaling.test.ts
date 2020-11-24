import { App, Stack } from '@aws-cdk/core';
import { GitlabRunnerAutoscaling } from '../src/index';
import '@aws-cdk/assert/jest';


test('Can set Autoscaling size', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 4,
    maxCapacity: 4,
    desiredCapacity: 4,
  });
  expect(stack).toHaveResource('AWS::AutoScaling::AutoScalingGroup', {
    MinSize: '4',
    MaxSize: '4',
    DesiredCapacity: '4',
  });
});
