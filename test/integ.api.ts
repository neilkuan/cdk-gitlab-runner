import { GitlabContainerRunner } from '../lib/index';
import { App, Stack } from '@aws-cdk/core';
import { InstanceType, InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';

const mockApp = new App();
const stack = new Stack(mockApp, 'testing-stack');

new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN', ec2type: InstanceType.of(InstanceClass.T3, InstanceSize.SMALL) });
