import { anything } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import { App, Stack } from '@aws-cdk/core';
import { GitlabRunnerAutoscaling } from '../src/index';

const defaultProps = {
  instanceType: 't3.micro',
  tags: ['gitlab', 'awscdk', 'runner'],
  gitlabUrl: 'https://gitlab.com/',
  gitlabRunnerImage: 'public.ecr.aws/gitlab/gitlab-runner:alpine',
};


test('Can set autoscaling capacities', () => {
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 2,
    maxCapacity: 4,
    desiredCapacity: 3,
  });

  expect(stack).toHaveResource('AWS::AutoScaling::AutoScalingGroup', {
    MinSize: '2',
    MaxSize: '4',
    DesiredCapacity: '3',
  });
});

test('Can set User Data', () => {
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  const props = {
    gitlabToken: 'GITLAB_TOKEN',
  };
  const runner = new GitlabRunnerAutoscaling(stack, 'testing', props);

  expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      UserData: {
        'Fn::Base64': {
          'Fn::Join': ['', [
            "#!/bin/bash\nmkdir -p $(dirname '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json')\naws s3 cp 's3://",
            anything(),
            '/',
            anything(),
            anything(),
            `' '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json'\n${runner.createUserData({ ...defaultProps, ...props }).join('\n')}`,
          ]],
        },
      },
    },
  });
});

test('Can set Docker Volumes', () => {
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  const props = {
    gitlabToken: 'GITLAB_TOKEN',
    dockerVolumes: [{
      hostPath: '/tmp/cache',
      containerPath: '/tmp/cache',
    }],
  };
  const runner = new GitlabRunnerAutoscaling(stack, 'testing', props);

  expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      UserData: {
        'Fn::Base64': {
          'Fn::Join': ['', [
            "#!/bin/bash\nmkdir -p $(dirname '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json')\naws s3 cp 's3://",
            anything(),
            '/',
            anything(),
            anything(),
            `' '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json'\n${runner.createUserData({ ...defaultProps, ...props }).join('\n')}`,
          ]],
        },
      },
    },
  });

});

test('Can launch as spot instance', () => {
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    spotInstance: true,
  });

  expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      InstanceMarketOptions: {
        MarketType: 'spot',
        SpotOptions: {
          SpotInstanceType: 'one-time',
        },
      },
    },
  });
});

test('Can set instance type', () => {
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    instanceType: 't3.large',
  });

  expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      InstanceType: 't3.large',
    },
  });
});

test('Can set EBS size', () => {
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    ebsSize: 100,
  });

  expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/xvda',
          Ebs: {
            VolumeSize: 100,
          },
        },
      ],
    },
  });
});

test('Can overwrite props', () => {
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 2,
    ebsSize: 100,
    instanceType: 't3.large',
    spotInstance: true,
  });

  expect(stack).toHaveResource('AWS::AutoScaling::AutoScalingGroup', {
    MinSize: '2',
    MaxSize: '2',
  });

  expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/xvda',
          Ebs: {
            VolumeSize: 100,
          },
        },
      ],
      InstanceMarketOptions: {
        MarketType: 'spot',
        SpotOptions: {
          SpotInstanceType: 'one-time',
        },
      },
      InstanceType: 't3.large',
    },
  });
});
