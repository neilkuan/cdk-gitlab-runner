import { App, Stack } from '@aws-cdk/core';
import { GitlabRunnerAutoscaling } from '../src/index';
import '@aws-cdk/assert/jest';

const defaultProps = {
  instanceType: 't3.micro',
  tags: ['gitlab', 'awscdk', 'runner'],
  gitlabUrl: 'https://gitlab.com/',
  gitlabRunnerImage: 'public.ecr.aws/gitlab/gitlab-runner:alpine',
};


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

test('Check User Data', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const props = {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 4,
    maxCapacity: 4,
    desiredCapacity: 4,
  };
  const runner = new GitlabRunnerAutoscaling(stack, 'testing', props);
  expect(stack).toHaveResource('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/xvda',
          Ebs: {
            VolumeSize: 60,
          },
        },
      ],
      IamInstanceProfile: {
        Arn: {
          'Fn::GetAtt': [
            'testingInstanceProfile8AC9DD14',
            'Arn',
          ],
        },
      },
      ImageId: {
        Ref: 'SsmParameterValueawsserviceamiamazonlinuxlatestamzn2amihvmx8664gp2C96584B6F00A464EAD1953AFF4B05118Parameter',
      },
      InstanceMarketOptions: {},
      InstanceType: 't3.micro',
      SecurityGroupIds: [
        {
          'Fn::GetAtt': [
            'testingGitlabRunnerSecurityGroup88DBF615',
            'GroupId',
          ],
        },
      ],
      UserData: {
        'Fn::Base64': `#!/bin/bash\n${runner.createUserData({ ...defaultProps, ...props }).join('\n')}`,
      },
    },
  });
});


test('Check Docker Volumes', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const props = {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 4,
    maxCapacity: 4,
    desiredCapacity: 4,
    ebsSize: 30,
    dockerVolumes: [{
      hostPath: '/tmp/cache',
      containerPath: '/tmp/cache',
    }],
  };
  const runner = new GitlabRunnerAutoscaling(stack, 'testing', props);
  expect(stack).toHaveResource('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/xvda',
          Ebs: {
            VolumeSize: 30,
          },
        },
      ],
      IamInstanceProfile: {
        Arn: {
          'Fn::GetAtt': [
            'testingInstanceProfile8AC9DD14',
            'Arn',
          ],
        },
      },
      ImageId: {
        Ref: 'SsmParameterValueawsserviceamiamazonlinuxlatestamzn2amihvmx8664gp2C96584B6F00A464EAD1953AFF4B05118Parameter',
      },
      InstanceMarketOptions: {},
      InstanceType: 't3.micro',
      SecurityGroupIds: [
        {
          'Fn::GetAtt': [
            'testingGitlabRunnerSecurityGroup88DBF615',
            'GroupId',
          ],
        },
      ],
      UserData: {
        'Fn::Base64': `#!/bin/bash\n${runner.createUserData({ ...defaultProps, ...props }).join('\n')}`,
      },
    },
  });
});

test('Check use spot instance', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const props = {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 4,
    maxCapacity: 4,
    desiredCapacity: 4,
    spotInstance: true,
    dockerVolumes: [{
      hostPath: '/tmp/cache',
      containerPath: '/tmp/cache',
    }],
  };
  const runner = new GitlabRunnerAutoscaling(stack, 'testing', props);
  expect(stack).toHaveResource('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/xvda',
          Ebs: {
            VolumeSize: 60,
          },
        },
      ],
      IamInstanceProfile: {
        Arn: {
          'Fn::GetAtt': [
            'testingInstanceProfile8AC9DD14',
            'Arn',
          ],
        },
      },
      ImageId: {
        Ref: 'SsmParameterValueawsserviceamiamazonlinuxlatestamzn2amihvmx8664gp2C96584B6F00A464EAD1953AFF4B05118Parameter',
      },
      InstanceMarketOptions: {
        MarketType: 'spot',
        SpotOptions: {
          SpotInstanceType: 'one-time',
        },
      },
      InstanceType: 't3.micro',
      SecurityGroupIds: [
        {
          'Fn::GetAtt': [
            'testingGitlabRunnerSecurityGroup88DBF615',
            'GroupId',
          ],
        },
      ],
      UserData: {
        'Fn::Base64': `#!/bin/bash\n${runner.createUserData({ ...defaultProps, ...props }).join('\n')}`,
      },
    },
  });
});

test('Check instance type change', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const props = {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 4,
    maxCapacity: 4,
    desiredCapacity: 4,
    instanceType: 't3.large',
    spotInstance: true,
    dockerVolumes: [{
      hostPath: '/tmp/cache',
      containerPath: '/tmp/cache',
    }],
  };
  const runner = new GitlabRunnerAutoscaling(stack, 'testing', props);
  expect(stack).toHaveResource('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/xvda',
          Ebs: {
            VolumeSize: 60,
          },
        },
      ],
      IamInstanceProfile: {
        Arn: {
          'Fn::GetAtt': [
            'testingInstanceProfile8AC9DD14',
            'Arn',
          ],
        },
      },
      ImageId: {
        Ref: 'SsmParameterValueawsserviceamiamazonlinuxlatestamzn2amihvmx8664gp2C96584B6F00A464EAD1953AFF4B05118Parameter',
      },
      InstanceMarketOptions: {
        MarketType: 'spot',
        SpotOptions: {
          SpotInstanceType: 'one-time',
        },
      },
      InstanceType: 't3.large',
      SecurityGroupIds: [
        {
          'Fn::GetAtt': [
            'testingGitlabRunnerSecurityGroup88DBF615',
            'GroupId',
          ],
        },
      ],
      UserData: {
        'Fn::Base64': `#!/bin/bash\n${runner.createUserData({ ...defaultProps, ...props }).join('\n')}`,
      },
    },
  });
});

test('Can overwrite default props', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const props = {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 4,
    maxCapacity: 4,
    desiredCapacity: 4,
    tags: ['a', 'b', 'c'],
    gitlabUrl: 'https://gitlab.example.com',
    gitlabRunnerImage: 'gitlab/gitlab-runner:alpine',
    instanceType: 't3.large',
    spotInstance: true,
    dockerVolumes: [{
      hostPath: '/tmp/cache',
      containerPath: '/tmp/cache',
    }],
  };
  const runner = new GitlabRunnerAutoscaling(stack, 'testing', props);
  expect(stack).toHaveResource('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/xvda',
          Ebs: {
            VolumeSize: 60,
          },
        },
      ],
      IamInstanceProfile: {
        Arn: {
          'Fn::GetAtt': [
            'testingInstanceProfile8AC9DD14',
            'Arn',
          ],
        },
      },
      ImageId: {
        Ref: 'SsmParameterValueawsserviceamiamazonlinuxlatestamzn2amihvmx8664gp2C96584B6F00A464EAD1953AFF4B05118Parameter',
      },
      InstanceMarketOptions: {
        MarketType: 'spot',
        SpotOptions: {
          SpotInstanceType: 'one-time',
        },
      },
      InstanceType: 't3.large',
      SecurityGroupIds: [
        {
          'Fn::GetAtt': [
            'testingGitlabRunnerSecurityGroup88DBF615',
            'GroupId',
          ],
        },
      ],
      UserData: {
        'Fn::Base64': `#!/bin/bash\n${runner.createUserData({ ...defaultProps, ...props }).join('\n')}`,
      },
    },
  });
});
