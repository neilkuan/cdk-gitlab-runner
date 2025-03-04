import { App, Stack, Duration } from 'aws-cdk-lib';
import * as assertions from 'aws-cdk-lib/assertions';
import { Peer, Port, Vpc, SubnetType, IpAddresses, BlockDeviceVolume } from 'aws-cdk-lib/aws-ec2';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import {
  GitlabContainerRunner,
  InstanceInterruptionBehavior,
} from '../src/index';


test('Create the Runner', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN', gitlabRunnerVersion: '15.9' });
  assertions.Template.fromStack(stack).findResources('AWS::EC2::Instance');
  assertions.Template.fromStack(stack).findResources('AWS::IAM::Role');
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::SecurityGroup', {
    SecurityGroupEgress: [
      {
        CidrIp: '0.0.0.0/0',
        Description: 'Allow all outbound traffic by default',
        IpProtocol: '-1',
      },
    ],
  });
});

test('Testing runner tag change ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabContainerRunner(stack, 'testing-have-type-tag', {
    gitlabtoken: 'GITLAB_TOKEN',
    tags: ['aa', 'bb', 'cc'],
    gitlabRunnerVersion: '15.9',
  });
  assertions.Template.fromStack(stack).findResources('AWS::EC2::Instance');
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::SecurityGroup', {
    SecurityGroupEgress: [
      {
        CidrIp: '0.0.0.0/0',
        Description: 'Allow all outbound traffic by default',
        IpProtocol: '-1',
      },
    ],
  });
});

test('Testing Runner Instance Type Change ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    ec2type: 't2.micro',
    gitlabRunnerVersion: '15.9',
  });
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::SecurityGroup', {
    SecurityGroupEgress: [
      {
        CidrIp: '0.0.0.0/0',
        Description: 'Allow all outbound traffic by default',
        IpProtocol: '-1',
      },
    ],
  });
});

test('Runner Can Add Ingress ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const runner = new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    ec2type: 't2.micro',
    tags: ['aa', 'bb', 'cc'],
    gitlabRunnerVersion: '15.9',
  });
  runner.runnerEc2.connections.allowFrom(Peer.ipv4('1.2.3.4/8'), Port.tcp(80));
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16',
  });
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::SecurityGroup', {
    SecurityGroupIngress: [
      {
        CidrIp: '1.2.3.4/8',
        Description: 'from 1.2.3.4/8:80',
        FromPort: 80,
        IpProtocol: 'tcp',
        ToPort: 80,
      },
    ],
  });
});

test('Runner Can Use Self VPC ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const newvpc = new Vpc(stack, 'NEWVPC', {
    ipAddresses: IpAddresses.cidr('10.1.0.0/16'),
    maxAzs: 2,
    subnetConfiguration: [
      {
        cidrMask: 26,
        name: 'RunnerVPC',
        subnetType: SubnetType.PUBLIC,
      },
    ],
    natGateways: 0,
  });
  new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    ec2type: 't2.micro',
    selfvpc: newvpc,
    gitlabRunnerVersion: '15.9',
  });
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.1.0.0/16',
  });
});

test('Runner Can Use Self Role ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const role = new Role(stack, 'runner-role', {
    assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
    description: 'For Gitlab EC2 Runner Test Role',
    roleName: 'TestRole',
  });
  new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    ec2type: 't2.micro',
    ec2iamrole: role,
    gitlabRunnerVersion: '15.9',
  });
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::IAM::Role', {
    RoleName: 'TestRole',
  });
});

test('Can Use Coustom Gitlab Url', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const newvpc = new Vpc(stack, 'NEWVPC', {
    ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
    maxAzs: 2,
    natGateways: 1,
  });
  new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    gitlaburl: 'https://gitlab.my.com/',
    selfvpc: newvpc,
    vpcSubnet: {
      subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    },
    gitlabRunnerVersion: '15.9',
  });

  assertions.Template.fromStack(stack).findResources('AWS::EC2::Instance');
});

test('Can Use Coustom EBS Size', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    onDemandEbsConfig: BlockDeviceVolume.ebs(50, { encrypted: true }),
    gitlabRunnerVersion: '15.9',
  });
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    BlockDeviceMappings: [
      {
        DeviceName: '/dev/xvda',
        Ebs: {
          VolumeSize: 50,
          Encrypted: true,
        },
      },
    ],
  });
});

test('Can Use Spotfleet Runner', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const testspot = new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    spotFleet: true,
    instanceInterruptionBehavior: InstanceInterruptionBehavior.HIBERNATE,
    spotEbsConfig: {
      volumeSize: 100,
      encrypted: true,
    },
    vpcSubnet: {
      subnetType: SubnetType.PUBLIC,
    },
    gitlabRunnerVersion: '15.9',
  });
  testspot.expireAfter(Duration.hours(6));
  assertions.Template.fromStack(stack).findResources('AWS::EC2::SpotFleet');
});

test('Can Use Spotfleet Runner None ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const newvpc = new Vpc(stack, 'NEWVPC', {
    ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
    maxAzs: 2,
    natGateways: 1,
  });
  const testspot = new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    spotFleet: true,
    selfvpc: newvpc,
    vpcSubnet: {
      subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    },
    gitlabRunnerVersion: '15.9',
  });
  testspot.expireAfter(Duration.hours(6));
  assertions.Template.fromStack(stack).findResources('AWS::EC2::SpotFleet');
});

test('User data with additional docker volumes', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const props = {
    gitlabtoken: 'GITLAB_TOKEN',
    dockerVolumes: [
      {
        hostPath: '/tmp/cahce',
        containerPath: '/tmp/cahce',
      },
    ],
    gitlabRunnerVersion: '15.9',
  };
  new GitlabContainerRunner(stack, 'testing', props);

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    UserData: {
      'Fn::Base64': {
        'Fn::Join': [
          '',
          [
            "#!/bin/bash\nyum update -y \nsleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register public.ecr.aws/gitlab/gitlab-runner:latest register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\" --docker-volumes \"/tmp/cahce:/tmp/cahce\"       --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\"       --tag-list \"gitlab,awscdk,runner\"  --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner public.ecr.aws/gitlab/gitlab-runner:latest\nsed -i 's/concurrent = .*/concurrent = 1/g' /home/ec2-user/.gitlab-runner/config.toml\nTOKEN=$(cat /home/ec2-user/.gitlab-runner/config.toml | grep 'token ' | awk '{print $3}'| tr -d '\"')\naws ssm put-parameter --name ",
            {
              Ref: 'testingGitlabTokenParameterD6C98250',
            },
            ' --value $TOKEN --overwrite --region ',
            {
              Ref: 'AWS::Region',
            },
          ],
        ],
      },
    },
  });
});

test('User data with the default docker volume', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const props = {
    gitlabtoken: 'GITLAB_TOKEN',
    gitlabRunnerVersion: '15.9',
  };
  new GitlabContainerRunner(stack, 'testing', props);
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    UserData: {
      'Fn::Base64': {
        'Fn::Join': [
          '',
          [
            "#!/bin/bash\nyum update -y \nsleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register public.ecr.aws/gitlab/gitlab-runner:latest register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\"       --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\"       --tag-list \"gitlab,awscdk,runner\"  --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner public.ecr.aws/gitlab/gitlab-runner:latest\nsed -i 's/concurrent = .*/concurrent = 1/g' /home/ec2-user/.gitlab-runner/config.toml\nTOKEN=$(cat /home/ec2-user/.gitlab-runner/config.toml | grep 'token ' | awk '{print $3}'| tr -d '\"')\naws ssm put-parameter --name ",
            {
              Ref: 'testingGitlabTokenParameterD6C98250',
            },
            ' --value $TOKEN --overwrite --region ',
            {
              Ref: 'AWS::Region',
            },
          ],
        ],
      },
    },
  });
});

test('Use dockerhub.io container image', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const props = {
    gitlabtoken: 'GITLAB_TOKEN',
    gitlabRunnerImage: 'gitlab/gitlab-runner:alpine',
    gitlabRunnerVersion: '15.9',
  };
  new GitlabContainerRunner(stack, 'testing', props);
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    UserData: {
      'Fn::Base64': {
        'Fn::Join': [
          '',
          [
            "#!/bin/bash\nyum update -y \nsleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\"       --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\"       --tag-list \"gitlab,awscdk,runner\"  --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine\nsed -i 's/concurrent = .*/concurrent = 1/g' /home/ec2-user/.gitlab-runner/config.toml\nTOKEN=$(cat /home/ec2-user/.gitlab-runner/config.toml | grep 'token ' | awk '{print $3}'| tr -d '\"')\naws ssm put-parameter --name ",
            {
              Ref: 'testingGitlabTokenParameterD6C98250',
            },
            ' --value $TOKEN --overwrite --region ',
            {
              Ref: 'AWS::Region',
            },
          ],
        ],
      },
    },
  });
});

test('User data with custom description', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const props = {
    gitlabtoken: 'GITLAB_TOKEN',
    runnerDescription: 'TEST RUNNER NAME',
    gitlabRunnerVersion: '15.9',
  };
  new GitlabContainerRunner(stack, 'testing', props);
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    UserData: {
      'Fn::Base64': {
        'Fn::Join': [
          '',
          [
            "#!/bin/bash\nyum update -y \nsleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register public.ecr.aws/gitlab/gitlab-runner:latest register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\"       --executor docker --docker-image \"alpine:latest\" --description \"TEST RUNNER NAME\"       --tag-list \"gitlab,awscdk,runner\"  --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner public.ecr.aws/gitlab/gitlab-runner:latest\nsed -i 's/concurrent = .*/concurrent = 1/g' /home/ec2-user/.gitlab-runner/config.toml\nTOKEN=$(cat /home/ec2-user/.gitlab-runner/config.toml | grep 'token ' | awk '{print $3}'| tr -d '\"')\naws ssm put-parameter --name ",
            {
              Ref: 'testingGitlabTokenParameterD6C98250',
            },
            ' --value $TOKEN --overwrite --region ',
            {
              Ref: 'AWS::Region',
            },
          ],
        ],
      },
    },
  });
});

test('User data with the configured concurrent jobs', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const props = {
    gitlabtoken: 'GITLAB_TOKEN',
    concurrentJobs: 5,
    gitlabRunnerVersion: '15.9',
  };
  new GitlabContainerRunner(stack, 'testing', props);
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    UserData: {
      'Fn::Base64': {
        'Fn::Join': [
          '',
          [
            "#!/bin/bash\nyum update -y \nsleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register public.ecr.aws/gitlab/gitlab-runner:latest register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN       --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\"       --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\"       --tag-list \"gitlab,awscdk,runner\"  --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner public.ecr.aws/gitlab/gitlab-runner:latest\nsed -i 's/concurrent = .*/concurrent = 5/g' /home/ec2-user/.gitlab-runner/config.toml\nTOKEN=$(cat /home/ec2-user/.gitlab-runner/config.toml | grep 'token ' | awk '{print $3}'| tr -d '\"')\naws ssm put-parameter --name ",
            {
              Ref: 'testingGitlabTokenParameterD6C98250',
            },
            ' --value $TOKEN --overwrite --region ',
            {
              Ref: 'AWS::Region',
            },
          ],
        ],
      },
    },
  });
});

test('User data with the configured concurrent jobs gitlabRunnerVersion 15.10', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const props = {
    gitlabtoken: 'glrt-GITLAB_TOKEN',
    concurrentJobs: 5,
    gitlabRunnerVersion: '15.10',
  };
  new GitlabContainerRunner(stack, 'testing', props);
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    UserData: {
      'Fn::Base64': {
        'Fn::Join': [
          '',
          [
            "#!/bin/bash\nyum update -y \nsleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register public.ecr.aws/gitlab/gitlab-runner:latest register --non-interactive --url https://gitlab.com/ --token glrt-GITLAB_TOKEN       --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\"       --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\"       undefined --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner public.ecr.aws/gitlab/gitlab-runner:latest\nsed -i 's/concurrent = .*/concurrent = 5/g' /home/ec2-user/.gitlab-runner/config.toml\nTOKEN=$(cat /home/ec2-user/.gitlab-runner/config.toml | grep 'token ' | awk '{print $3}'| tr -d '\"')\naws ssm put-parameter --name ",
            {
              Ref: 'testingGitlabTokenParameterD6C98250',
            },
            ' --value $TOKEN --overwrite --region ',
            {
              Ref: 'AWS::Region',
            },
          ],
        ],
      },
    },
  });
});

test('Test gitlabRunnerVersion 15.10 use not glrt-xxxxx gitlabToken', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const props = {
    gitlabtoken: 'GITLAB_TOKEN',
    concurrentJobs: 5,
    gitlabRunnerVersion: '15.10',
  };
  expect(() => {
    new GitlabContainerRunner(stack, 'testing', props);
  }).toThrow('If gitlabRunnerVersion >= 15.10, gitlabtoken please give glrt-xxxxxxx @see https://docs.gitlab.com/ee/ci/runners/new_creation_workflow.html');
});

test('Enabled IMDSv2', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const props = {
    gitlabtoken: 'glrt-GITLAB_TOKEN',
    concurrentJobs: 5,
    gitlabRunnerVersion: '15.10',
    enabledIMDSv2: true,
  };
  new GitlabContainerRunner(stack, 'testing', props);

  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::LaunchTemplate',
    assertions.Match.objectLike({
      LaunchTemplateData: {
        MetadataOptions: {
          HttpPutResponseHopLimit: 2,
          HttpTokens: 'required',
        },
      },
    }));
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::Instance', {
    LaunchTemplate: {
      LaunchTemplateId: {
        Ref: 'testingTemplate00432C5D',
      },
      Version: {
        'Fn::GetAtt': [
          'testingTemplate00432C5D',
          'LatestVersionNumber',
        ],
      },
    },
    UserData: {
      'Fn::Base64': {
        'Fn::Join': [
          '',
          [
            "#!/bin/bash\nyum update -y \nsleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock\nsystemctl restart docker && systemctl enable docker\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock       --name gitlab-runner-register public.ecr.aws/gitlab/gitlab-runner:latest register --non-interactive --url https://gitlab.com/ --token glrt-GITLAB_TOKEN       --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\"       --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\"       undefined --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner public.ecr.aws/gitlab/gitlab-runner:latest\nsed -i 's/concurrent = .*/concurrent = 5/g' /home/ec2-user/.gitlab-runner/config.toml\nTOKEN=$(cat /home/ec2-user/.gitlab-runner/config.toml | grep 'token ' | awk '{print $3}'| tr -d '\"')\naws ssm put-parameter --name ",
            {
              Ref: 'testingGitlabTokenParameterD6C98250',
            },
            ' --value $TOKEN --overwrite --region ',
            {
              Ref: 'AWS::Region',
            },
          ],
        ],
      },
    },
  });
});
