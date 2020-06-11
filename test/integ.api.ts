import { GitlabContainerRunner } from '../lib/index';
import { App, Stack } from '@aws-cdk/core';

const mockApp = new App();
const stack = new Stack(mockApp, 'testing-stack');

new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLABTOKEN' });
