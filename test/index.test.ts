import {
  GitlabContainerRunner,
  InstanceInterruptionBehavior,
  BlockDuration,
} from '../src/index';
import { App, Stack, Duration } from '@aws-cdk/core';
import '@aws-cdk/assert/jest';
import { Peer, Port, Vpc, SubnetType } from '@aws-cdk/aws-ec2';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';

test('Create the Runner', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN' });
  expect(stack).toHaveResource('AWS::EC2::Instance');
  expect(stack).toHaveResource('AWS::IAM::Role');
  expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
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
    tag1: 'aa',
    tag2: 'bb',
    tag3: 'cc',
  });
  expect(stack).toHaveResource('AWS::EC2::Instance');
  expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
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
  });
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
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
    tag1: 'aa',
    tag2: 'bb',
    tag3: 'cc',
  });
  runner.runnerEc2.connections.allowFrom(Peer.ipv4('1.2.3.4/8'), Port.tcp(80));
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  expect(stack).toHaveResource('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16',
  });
  expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
    SecurityGroupIngress: [
      {
        CidrIp: '0.0.0.0/0',
        Description: 'from 0.0.0.0/0:22',
        FromPort: 22,
        IpProtocol: 'tcp',
        ToPort: 22,
      },
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
    cidr: '10.1.0.0/16',
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
  });
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  expect(stack).not.toHaveResource('AWS::S3::Bucket');
  expect(stack).toHaveResource('AWS::EC2::VPC', {
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
  });
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  expect(stack).toHaveResource('AWS::IAM::Role', {
    RoleName: 'TestRole',
  });
});

test('Can Use Coustom Gitlab Url', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const newvpc = new Vpc(stack, 'NEWVPC', {
    cidr: '10.1.0.0/16',
    maxAzs: 2,
    natGateways: 1,
  });
  new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    gitlaburl: 'https://gitlab.my.com/',
    selfvpc: newvpc,
    vpcSubnet: {
      subnetType: SubnetType.PRIVATE,
    },
  });

  expect(stack).toHaveResource('AWS::EC2::Instance');
});

test('Can Use Coustom EBS Size', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    ebsSize: 50,
  });
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    BlockDeviceMappings: [
      {
        DeviceName: '/dev/xvda',
        Ebs: {
          VolumeSize: 50,
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
    ebsSize: 100,
    blockDuration: BlockDuration.SIXTEEN_HOURS,
    vpcSubnet: {
      subnetType: SubnetType.PUBLIC,
    },
  });
  testspot.expireAfter(Duration.hours(6));
  expect(stack).toHaveResource('AWS::EC2::SpotFleet');
});

test('Can Use Spotfleet Runner None ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-spotfleet');
  const newvpc = new Vpc(stack, 'NEWVPC', {
    cidr: '10.1.0.0/16',
    maxAzs: 2,
    natGateways: 1,
  });
  const testspot = new GitlabContainerRunner(stack, 'testing', {
    gitlabtoken: 'GITLAB_TOKEN',
    spotFleet: true,
    selfvpc: newvpc,
    vpcSubnet: {
      subnetType: SubnetType.PRIVATE,
    },
  });
  testspot.expireAfter(Duration.hours(6));
  expect(stack).toHaveResource('AWS::EC2::SpotFleet');
});
