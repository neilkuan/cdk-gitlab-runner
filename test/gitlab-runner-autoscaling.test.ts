import { App, Stack } from 'aws-cdk-lib';
import * as assertions from 'aws-cdk-lib/assertions';
import { GitlabRunnerAutoscaling } from '../src/index';

test('Can set autoscaling capacities', () => {
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    minCapacity: 2,
    maxCapacity: 4,
    desiredCapacity: 3,
  });

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::AutoScaling::AutoScalingGroup', {
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
  new GitlabRunnerAutoscaling(stack, 'testing', props);

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::LaunchTemplate', {
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
        'Fn::Base64': {
          'Fn::Join': [
            '',
            [
              "#!/bin/bash\nmkdir -p $(dirname '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json')\naws s3 cp 's3://",
              {
                'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}',
              },
              "/95f5b9af7e6bb7ab466d97a46fb388d47cc2708cd61d933d91c43d026b74b164.json' '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json'\nyum update -y\nsleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker && systemctl start amazon-cloudwatch-agent && systemctl enable amazon-cloudwatch-agent\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register public.ecr.aws/gitlab/gitlab-runner:latest register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\"       --executor docker --docker-image \"alpine:latest\" --description \"A Runner on EC2 Instance (t3.micro)\"       --tag-list \"gitlab,awscdk,runner\" --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner public.ecr.aws/gitlab/gitlab-runner:latest",
            ],
          ],
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
  new GitlabRunnerAutoscaling(stack, 'testing', props);

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::LaunchTemplate', {
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
        'Fn::Base64': {
          'Fn::Join': [
            '',
            [
              "#!/bin/bash\nmkdir -p $(dirname '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json')\naws s3 cp 's3://",
              {
                'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}',
              },
              "/95f5b9af7e6bb7ab466d97a46fb388d47cc2708cd61d933d91c43d026b74b164.json' '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json'\nyum update -y\nsleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker && systemctl start amazon-cloudwatch-agent && systemctl enable amazon-cloudwatch-agent\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register public.ecr.aws/gitlab/gitlab-runner:latest register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\" --docker-volumes \"/tmp/cache:/tmp/cache\"       --executor docker --docker-image \"alpine:latest\" --description \"A Runner on EC2 Instance (t3.micro)\"       --tag-list \"gitlab,awscdk,runner\" --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner public.ecr.aws/gitlab/gitlab-runner:latest",
            ],
          ],
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

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::LaunchTemplate', {
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
        'Fn::Base64': {
          'Fn::Join': [
            '',
            [
              "#!/bin/bash\nmkdir -p $(dirname '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json')\naws s3 cp 's3://",
              {
                'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}',
              },
              "/95f5b9af7e6bb7ab466d97a46fb388d47cc2708cd61d933d91c43d026b74b164.json' '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json'\nyum update -y\nsleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker && systemctl start amazon-cloudwatch-agent && systemctl enable amazon-cloudwatch-agent\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register public.ecr.aws/gitlab/gitlab-runner:latest register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\"       --executor docker --docker-image \"alpine:latest\" --description \"A Runner on EC2 Instance (t3.micro)\"       --tag-list \"gitlab,awscdk,runner\" --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner public.ecr.aws/gitlab/gitlab-runner:latest",
            ],
          ],
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

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::LaunchTemplate', {
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

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::LaunchTemplate', {
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

test('Can set alarm settings', () => {
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  const alarmUserDefined = [
    {
      AlarmName: 'TestAlarm',
      MetricName: 'test_metric',
      Threshold: 50,
      Period: 300,
    },
  ];

  new GitlabRunnerAutoscaling(stack, 'testing', {
    gitlabToken: 'GITLAB_TOKEN',
    alarms: alarmUserDefined,
  });

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
    Handler: 'autoscaling_events.on_event',
    Environment: {
      Variables: {
        ALARMS: JSON.stringify(alarmUserDefined),
      },
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

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::AutoScaling::AutoScalingGroup', {
    MinSize: '2',
    MaxSize: '2',
  });

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::LaunchTemplate', {
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
