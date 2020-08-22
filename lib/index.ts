import { Construct, CfnOutput } from '@aws-cdk/core';
import { IRole, Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import {
  Instance,
  InstanceType,
  MachineImage,
  UserData,
  BlockDeviceVolume,
  AmazonLinuxGeneration,
  SubnetType,
  Vpc,
  IVpc,
  IInstance,
} from '@aws-cdk/aws-ec2';

export interface GitlabContainerRunnerProps {
  /**
   * Gitlab token for the Register Runner .
   *
   * @example
   * new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN' });
   *
   * @default - You must to give the token !!!
   *
   */
  readonly gitlabtoken: string;

  /**
   * Runner default EC2 instance type.
   *
   * @example
   * new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', ec2type: 't3.small' });
   *
   * @default - t3.micro
   *
   */
  readonly ec2type?: string;

  /**
   * VPC for the Gitlab Runner .
   *
   * @example
   * const newvpc = new Vpc(stack, 'NEWVPC', {
   *   cidr: '10.1.0.0/16',
   *   maxAzs: 2,
   *   subnetConfiguration: [{
   *     cidrMask: 26,
   *     name: 'RunnerVPC',
   *     subnetType: SubnetType.PUBLIC,
   *   }],
   *   natGateways: 0,
   * });
   *
   * new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', selfvpc: newvpc });
   *
   * @default - new VPC will be created , 1 Vpc , 2 Public Subnet .
   *
   */
  readonly selfvpc?: IVpc;

  /**
   * IAM role for the Gitlab Runner Instance .
   *
   * @example
   * const role = new Role(stack, 'runner-role', {
   *   assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
   *   description: 'For Gitlab EC2 Runner Test Role',
   *   roleName: 'Myself-Runner-Role',
   * });
   *
   * new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', ec2iamrole: role });
   *
   * @default - new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .
   *
   */
  readonly ec2iamrole?: IRole;

  /**
   * Gitlab Runner register tag1  .
   *
   * @example
   * new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', tag1: 'aa' });
   *
   * @default - tag1: gitlab .
   *
   */
  readonly tag1?: string;

  /**
   * Gitlab Runner register tag2  .
   *
   * @example
   * new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', tag2: 'bb' });
   *
   * @default - tag2: awscdk .
   *
   */
  readonly tag2?: string;

  /**
   * Gitlab Runner register tag3  .
   *
   * @example
   * new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', tag3: 'cc' });
   *
   * @default - tag3: runner .
   *
   */
  readonly tag3?: string;

  /**
   * Gitlab Runner register url .
   *
   * @example
   * const runner = new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN',gitlaburl: 'https://gitlab.com/'});
   *
   * @default - gitlaburl='https://gitlab.com/'
   *
   */
  readonly gitlaburl?: string;

  /**
   * Gitlab Runner instance EBS size .
   *
   * @example
   * const runner = new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN',ebsSize: 100});
   *
   * @default - ebsSize=60
   *
   */
  readonly ebsSize?: number;
}

export class GitlabContainerRunner extends Construct {
  /**
   * The IAM role assumed by the Runner instance .
   */
  public readonly runnerRole: IRole;

  /**
   * This represents a Runner EC2 instance .
   */
  public readonly runnerEc2: IInstance;
  constructor(scope: Construct, id: string, props: GitlabContainerRunnerProps) {
    super(scope, id);

    const vpc =
      props.selfvpc ??
      new Vpc(this, 'VPC', {
        cidr: '10.0.0.0/16',
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
    const token = props.gitlabtoken;
    const tag1 = props.tag1 ?? 'gitlab';
    const tag2 = props.tag2 ?? 'awscdk';
    const tag3 = props.tag3 ?? 'runner';
    const gitlaburl = props.gitlaburl ?? 'https://gitlab.com/';
    const ec2type = props.ec2type ?? 't3.micro';
    const ebsSize = props.ebsSize ?? 60;
    const shell = UserData.forLinux();
    shell.addCommands('yum update -y');
    shell.addCommands('yum install docker -y');
    shell.addCommands('service docker start');
    shell.addCommands('usermod -aG docker ec2-user');
    shell.addCommands('chmod +x /var/run/docker.sock');
    shell.addCommands('service docker restart &&  chkconfig docker on');
    shell.addCommands(
      'docker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url ' +
        gitlaburl +
        ' --registration-token ' +
        token +
        ' --docker-pull-policy if-not-present --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" --executor docker --docker-image "alpine:latest" --description "Docker Runner" --tag-list "' +
        tag1 +
        ',' +
        tag2 +
        ',' +
        tag3 +
        '" --docker-privileged'
    );
    shell.addCommands(
      'sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine'
    );
    shell.addCommands('usermod -aG docker ssm-user');

    this.runnerRole =
      props.ec2iamrole ??
      new Role(this, 'runner-role', {
        assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
        description: 'For Gitlab EC2 Runner Role',
      });

    this.runnerEc2 = new Instance(this, 'GitlabRunner', {
      instanceType: new InstanceType(ec2type),
      instanceName: 'Gitlab-Runner',
      vpc,
      machineImage: MachineImage.latestAmazonLinux({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      role: this.runnerRole,
      userData: shell,
      blockDevices: [
        { deviceName: '/dev/xvda', volume: BlockDeviceVolume.ebs(ebsSize) },
      ],
    });

    this.runnerRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    );

    new CfnOutput(this, 'Runner-Instance-ID', {
      value: this.runnerEc2.instanceId,
    });
    new CfnOutput(this, 'Runner-Role-Arn', { value: this.runnerRole.roleArn });
  }
}
