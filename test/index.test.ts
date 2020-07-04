import { GitlabContainerRunner } from '../lib/index';
import { App, Stack } from '@aws-cdk/core';
import '@aws-cdk/assert/jest';
import { Peer, Port, Vpc, SubnetType } from '@aws-cdk/aws-ec2';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam'


test('Create the Runner', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN' });
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    UserData: {
      'Fn::Base64': '#!/bin/bash\nyum update -y\nyum install docker -y\nservice docker start\nusermod -aG docker ec2-user\nchmod +x /var/run/docker.sock\nservice docker restart &&  chkconfig docker on\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\" --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\" --tag-list \"gitlab,awscdk,runner\" --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine\nusermod -aG docker ssm-user',
    },
  });
  expect(stack).toHaveResource('AWS::IAM::Role');
  expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
    SecurityGroupEgress: [{
      CidrIp: '0.0.0.0/0',
      Description: 'Allow all outbound traffic by default',
      IpProtocol: '-1',
    }],
  });
});

test('Testing runner tag change ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabContainerRunner(stack, 'testing-have-type-tag', { gitlabtoken: 'GITLAB_TOKEN', tag1: 'aa', tag2: 'bb', tag3: 'cc' });
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    UserData: {
      'Fn::Base64': '#!/bin/bash\nyum update -y\nyum install docker -y\nservice docker start\nusermod -aG docker ec2-user\nchmod +x /var/run/docker.sock\nservice docker restart &&  chkconfig docker on\ndocker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url https://gitlab.com/ --registration-token GITLAB_TOKEN --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\" --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\" --tag-list \"aa,bb,cc\" --docker-privileged\nsleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine\nusermod -aG docker ssm-user',
    },
  });
  expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
    SecurityGroupEgress: [{
      CidrIp: '0.0.0.0/0',
      Description: 'Allow all outbound traffic by default',
      IpProtocol: '-1',
    }],
  });
});

test('Testing Runner Instance Type Change ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN', ec2type: 't2.micro' });
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
    SecurityGroupEgress: [{
      CidrIp: '0.0.0.0/0',
      Description: 'Allow all outbound traffic by default',
      IpProtocol: '-1',
    }],
  });
});

test('Runner Can Add Ingress ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const runner = new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN', ec2type: 't2.micro', tag1: 'aa', tag2: 'bb', tag3: 'cc' });
  runner.runnerEc2.connections.allowFrom(Peer.ipv4('1.2.3.4/8'), Port.tcp(80));
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  expect(stack).toHaveResource('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16',
  },
  );
  expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
    SecurityGroupIngress: [{
      CidrIp: '1.2.3.4/8',
      Description: 'from 1.2.3.4/8:80',
      FromPort: 80,
      IpProtocol: 'tcp',
      ToPort: 80,
    }],
  });
});

test('Runner Can Use Self VPC ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const newvpc = new Vpc(stack, 'NEWVPC', {
    cidr: '10.1.0.0/16',
    maxAzs: 2,
    subnetConfiguration: [{
      cidrMask: 26,
      name: 'RunnerVPC',
      subnetType: SubnetType.PUBLIC,
    }],
    natGateways: 0,
  });
  new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN', ec2type: 't2.micro', selfvpc: newvpc });
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  expect(stack).not.toHaveResource('AWS::S3::Bucket');
  expect(stack).toHaveResource('AWS::EC2::VPC', {
    CidrBlock: '10.1.0.0/16',
  },
  );
});


test('Runner Can Use Self Role ', () => {
  const mockApp = new App();
  const stack = new Stack(mockApp, 'testing-stack');
  const role = new Role(stack, 'runner-role', {
    assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
    description: 'For Gitlab EC2 Runner Test Role',
    roleName: 'TestRole',
  });
  new GitlabContainerRunner(stack, 'testing', { gitlabtoken: 'GITLAB_TOKEN', ec2type: 't2.micro', ec2iamrole: role });
  expect(stack).toHaveResource('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
  expect(stack).toHaveResource('AWS::IAM::Role', {
    RoleName: 'TestRole',
  },
  );
});