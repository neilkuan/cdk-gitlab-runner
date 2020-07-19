import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as ec2 from '@aws-cdk/aws-ec2';

export interface GitlabContainerRunnerProps {
  readonly gitlabtoken: string;
  readonly ec2type?: string;
  readonly selfvpc?: ec2.IVpc;
  readonly ec2iamrole?: iam.IRole;
  readonly tag1?: string;
  readonly tag2?: string;
  readonly tag3?: string;
  readonly gitlaburl?: string;
}

export class GitlabContainerRunner extends cdk.Construct {
  public readonly runnerRole: iam.IRole;
  public readonly runnerEc2: ec2.IInstance;
  constructor(scope: cdk.Construct, id: string, props: GitlabContainerRunnerProps) {
    super(scope, id);

    const vpc = props.selfvpc ?? new ec2.Vpc(this, 'VPC', {
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
    var gitlaburl = props.gitlaburl ?? 'https://gitlab.com/'
    var ec2type = props.ec2type ?? 't3.micro'
    const shell = ec2.UserData.forLinux()
    shell.addCommands('yum update -y')
    shell.addCommands('yum install docker -y')
    shell.addCommands('service docker start')
    shell.addCommands('usermod -aG docker ec2-user')
    shell.addCommands('chmod +x /var/run/docker.sock')
    shell.addCommands('service docker restart &&  chkconfig docker on')
    shell.addCommands('docker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url ' + gitlaburl + ' --registration-token ' + token + ' --docker-pull-policy if-not-present --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\" --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\" --tag-list \"' + tag1 + ',' + tag2 + ',' + tag3 + '\" --docker-privileged')
    shell.addCommands('sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine')
    shell.addCommands('usermod -aG docker ssm-user')
    const ec2role = this.runnerRole = props.ec2iamrole ?? new iam.Role(this, 'runner-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'For Gitlab EC2 Runner Role',
    });
    const runner = this.runnerEc2 = new ec2.Instance(this, 'GitlabRunner', {
      instanceType: new ec2.InstanceType(ec2type),
      instanceName: 'Gitlab-Runner',
      vpc,
      machineImage: ec2.MachineImage.latestAmazonLinux({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
      role: ec2role,
      userData: shell,
      blockDevices: [({ deviceName: '/dev/xvda', volume: ec2.BlockDeviceVolume.ebs(60) })],
    });
    runner.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    new cdk.CfnOutput(this, 'Runner-Instance-ID', { value: runner.instanceId })
    new cdk.CfnOutput(this, 'Runner-Role-Arn', { value: runner.role.roleArn })

  }
}
