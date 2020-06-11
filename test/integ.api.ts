import { GitlabContainerRunner } from '../lib/index';
import { App, Stack } from '@aws-cdk/core';

const mockApp = new App();
const stack = new Stack(mockApp, 'testing-stack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN' });
