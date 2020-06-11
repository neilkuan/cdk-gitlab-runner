import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as ec2 from '@aws-cdk/aws-ec2';

export interface GitlabContainerRunnerProps {
  readonly gitlabtoken?: string;
}

export class GitlabContainerRunner extends cdk.Construct {
  readonly gitlabtoken: string;

  constructor(scope: cdk.Construct, id: string, props: GitlabContainerRunnerProps) {
    super(scope, id);
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      isDefault: true
    });
    var token = this.gitlabtoken = props.gitlabtoken ?? 'gitlab-token'
    const shell = ec2.UserData.forLinux()
    shell.addCommands('yum update -y')
    shell.addCommands('yum install docker -y')
    shell.addCommands('service docker start')
    shell.addCommands('usermod -aG docker ec2-user')
    shell.addCommands('chmod +x /var/run/docker.sock')
    shell.addCommands('service docker restart &&  chkconfig docker on')
    shell.addCommands('docker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url https://gitlab.com./ --registration-token ' + token + '  --docker-volumes \"/var/run/docker.sock:/var/run/docker.sock\" --executor docker --docker-image \"alpine:latest\" --description \"Docker Runner\" --tag-list \"gitlab,runner,awscdk\" --docker-privileged')
    shell.addCommands('sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine')
    shell.addCommands('usermod -aG docker ssm-user')

    const runner = new ec2.Instance(this, 'GitlabRunner', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
      instanceName: 'Gitlab-Runner',
      vpc,
      machineImage: new ec2.AmazonLinuxImage,
      userData: shell,
      blockDevices: [({ deviceName: '/dev/xvda', volume: ec2.BlockDeviceVolume.ebs(60) })]
    });
    runner.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    new cdk.CfnOutput(this, 'Runner-ID', { value: runner.instanceId })

  }
}