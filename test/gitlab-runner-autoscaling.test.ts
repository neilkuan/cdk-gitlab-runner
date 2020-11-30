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

test('Check User Data', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 4,
    maxCapacity: 4,
    desiredCapacity: 4,
  });
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
        'Fn::Base64': '#!/bin/bash\nyum update -y \nsleep 15 && yum install docker git -y && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --executor docker --docker-image "alpine:latest"       --description "A Runner on EC2 Instance (t3.micro)" --tag-list "gitlab,awscdk,runner" --docker-privileged --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" \nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine\nusermod -aG docker ssm-user',
      },
    },
  });
});


test('Check Docker Volumes', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 4,
    maxCapacity: 4,
    desiredCapacity: 4,
    ebsSize: 30,
    dockerVolumes: [{
      hostPath: '/tmp/cache',
      containerPath: '/tmp/cache',
    }],
  });
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
        'Fn::Base64': '#!/bin/bash\nyum update -y \nsleep 15 && yum install docker git -y && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --executor docker --docker-image "alpine:latest"       --description "A Runner on EC2 Instance (t3.micro)" --tag-list "gitlab,awscdk,runner" --docker-privileged --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" --docker-volumes "/tmp/cache:/tmp/cache" \nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine\nusermod -aG docker ssm-user',
      },
    },
  });
});

test('Check use spot instance', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 4,
    maxCapacity: 4,
    desiredCapacity: 4,
    spotInstance: true,
    dockerVolumes: [{
      hostPath: '/tmp/cache',
      containerPath: '/tmp/cache',
    }],
  });
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
        'Fn::Base64': '#!/bin/bash\nyum update -y \nsleep 15 && yum install docker git -y && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --executor docker --docker-image "alpine:latest"       --description "A Runner on EC2 Instance (t3.micro)" --tag-list "gitlab,awscdk,runner" --docker-privileged --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" --docker-volumes "/tmp/cache:/tmp/cache" \nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine\nusermod -aG docker ssm-user',
      },
    },
  });
});

test('Check instance type change', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
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
  });
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
        'Fn::Base64': '#!/bin/bash\nyum update -y \nsleep 15 && yum install docker git -y && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --executor docker --docker-image "alpine:latest"       --description "A Runner on EC2 Instance (t3.large)" --tag-list "gitlab,awscdk,runner" --docker-privileged --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" --docker-volumes "/tmp/cache:/tmp/cache" \nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine\nusermod -aG docker ssm-user',
      },
    },
  });
});

test('Check Tags list and gitlab Url', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 4,
    maxCapacity: 4,
    desiredCapacity: 4,
    tags: ['a', 'b', 'c'],
    gitlabUrl: 'https://gitlab.example.com',
    instanceType: 't3.large',
    spotInstance: true,
    dockerVolumes: [{
      hostPath: '/tmp/cache',
      containerPath: '/tmp/cache',
    }],
  });
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
        'Fn::Base64': '#!/bin/bash\nyum update -y \nsleep 15 && yum install docker git -y && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url https://gitlab.example.com --registration-token GITLAB_TOKEN       --executor docker --docker-image "alpine:latest"       --description "A Runner on EC2 Instance (t3.large)" --tag-list "a,b,c" --docker-privileged --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" --docker-volumes "/tmp/cache:/tmp/cache" \nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine\nusermod -aG docker ssm-user',
      },
    },
  });
});
