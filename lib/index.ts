import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as ec2 from '@aws-cdk/aws-ec2';

export interface GitlabContainerRunnerProps {
  readonly gitlabtoken: string;
  readonly ec2type?: ec2.InstanceType;
  readonly tag1?: string;
  readonly tag2?: string;
  readonly tag3?: string;
}

export class GitlabContainerRunner extends cdk.Construct {
  public readonly runnerrole: iam.IRole;
  constructor(scope: cdk.Construct, id: string, props: GitlabContainerRunnerProps) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, 'VPC', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      subnetConfiguration: [{
        cidrMask: 26,
        name: 'RunnerVPC',
        subnetType: ec2.SubnetType.PUBLIC,
      }],
      natGateways: 0,
    });
    var token = props.gitlabtoken;
    var tag1 = props.tag1 ?? 'gitlab'
    var tag2 = props.tag2 ?? 'awscdk'
    var tag3 = props.tag3 ?? 'runner'
    const shell = ec2.UserData.forLinux()
    shell.addCommands('yum update -y')
    shell.addCommands('yum install docker -y')
    shell.addCommands('service docker start')
    shell.addCommands('usermod -aG docker ec2-user')
    shell.addCommands('chmod +x /var/run/docker.sock')
    shell.addCommands('service docker restart &&  chkconfig docker on')
    shell.addCommands('docker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url https://gitlab.com./ --registration-token ' + token + '  --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\" --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\" --tag-list \"' + tag1 + ',' + tag2 + ',' + tag3 + '\" --docker-privileged')
    shell.addCommands('sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine')
    shell.addCommands('usermod -aG docker ssm-user')
    const ec2role = this.runnerrole = new iam.Role(this, 'runner-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'FOr Gitlab EC2 Runner Role',
    });
    const runner = new ec2.Instance(this, 'GitlabRunner', {
      instanceType: props.ec2type ?? ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
      instanceName: 'Gitlab-Runner',
      vpc,
      machineImage: new ec2.AmazonLinuxImage,
      role: ec2role,
      userData: shell,
      blockDevices: [({ deviceName: '/dev/xvda', volume: ec2.BlockDeviceVolume.ebs(60) })],
    });
    runner.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    new cdk.CfnOutput(this, 'Runner-Instance-ID', { value: runner.instanceId })
    new cdk.CfnOutput(this, 'Runner-Role-Arn', { value: runner.role.roleArn })

  }
}
