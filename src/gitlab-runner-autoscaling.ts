import * as path from 'path';
import {
  AutoScalingGroup,
  IAutoScalingGroup,
  BlockDeviceVolume,
  LifecycleTransition,
  DefaultResult,
} from '@aws-cdk/aws-autoscaling';
import { FunctionHook } from '@aws-cdk/aws-autoscaling-hooktargets';
import {
  InstanceType,
  MachineImage,
  UserData,
  AmazonLinuxGeneration,
  Vpc,
  IVpc,
  SubnetSelection,
  ISecurityGroup,
  SecurityGroup,
} from '@aws-cdk/aws-ec2';
import {
  IRole,
  Role,
  ServicePrincipal,
  ManagedPolicy,
  PolicyStatement,
  Policy,
  Effect,
} from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import {
  Construct,
  CfnOutput,
  Duration,
} from '@aws-cdk/core';

export interface GitlabRunnerAutoscalingProps {
  /**
   * Gitlab token.
   *
   * @example
   * new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN' });
   */
  readonly gitlabToken: string;

  /**
   * Runner default EC2 instance type.
   *
   * @example
   * new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', instanceType: 't3.small' });
   *
   * @default - t3.micro
   *
   */
  readonly instanceType?: string;

  /**
   * VPC for the Gitlab Runner .
   *
   * @example
   * const newVpc = new Vpc(stack, 'NewVPC', {
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
   * new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', vpc: newVpc });
   *
   * @default - A new VPC will be created.
   *
   */
  readonly vpc?: IVpc;

  /**
   * IAM role for the Gitlab Runner Instance .
   *
   * @example
   * const role = new Role(stack, 'runner-role', {
   *   assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
   *   description: 'For Gitlab Runner Test Role',
   *   roleName: 'Runner-Role',
   * });
   *
   * new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', instanceRole: role });
   *
   * @default - new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .
   *
   */
  readonly instanceRole?: IRole;

  /**
   * The maximum hourly price (in USD) to be paid for any Spot Instance launched to fulfill the request.
   * Spot Instances are launched when the price you specify exceeds the current Spot market price.
   *
   * @example
   * new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', spotPrice: 1.23 });
   *
   * @default - undefined
   *
   */
  readonly spotPrice?: string;

  /**
   * Minimum capacity limit for autoscaling group.
   *
   * @example
   * new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', minCapacity: 2 });
   *
   * @default - minCapacity: 1
   *
   */
  readonly minCapacity?: number;

  /**
   * Maximum capacity limit for autoscaling group.
   *
   * @example
   * new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', maxCapacity: 4 });
   *
   * @default - desiredCapacity
   *
   */
  readonly maxCapacity?: number;

  /**
   * Desired capacity limit for autoscaling group.
   *
   * @example
   * new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', desiredCapacity: 2 });
   *
   * @default - minCapacity, and leave unchanged during deployment
   *
   */
  readonly desiredCapacity?: number;

  /**
   * tags for the runner
   *
   * @default - ['runner', 'gitlab', 'awscdk']
   */
  readonly tags?: string[];

  /**
   * Gitlab Runner register url .
   *
   * @example
   * const runner = new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN',gitlabUrl: 'https://gitlab.com/'});
   *
   * @default - https://gitlab.com/ , The trailing slash is mandatory.
   *
   */
  readonly gitlabUrl?: string;

  /**
   * Gitlab Runner instance EBS size .
   *
   * @example
   * const runner = new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', ebsSize: 100});
   *
   * @default - ebsSize=60
   *
   */
  readonly ebsSize?: number;

  /**
   * VPC subnet
   *
   * @example
   * const vpc = new Vpc(stack, 'nat', {
   * natGateways: 1,
   * maxAzs: 2,
   * });
   * const runner = new GitlabRunnerAutoscaling(stack, 'testing', {
   *   gitlabToken: 'GITLAB_TOKEN',
   *   instanceType: 't3.large',
   *   instanceRole: role,
   *   ebsSize: 100,
   *   vpc: vpc,
   *   vpcSubnet: {
   *     subnetType: SubnetType.PUBLIC,
   *   },
   * });
   *
   * @default - private subnet
   */
  readonly vpcSubnet?: SubnetSelection;
}

export class GitlabRunnerAutoscaling extends Construct {
  /**
   * The IAM role assumed by the Runner instance.
   */
  public readonly instanceRole: IRole;

  /**
   * This represents a Runner Auto Scaling Group
   */
  public readonly autoscalingGroup: IAutoScalingGroup;

  /**
   * The EC2 runner's VPC.
   */
  public readonly vpc: IVpc;

  /**
   * The EC2 runner's default SecurityGroup.
   */
  public readonly securityGroup: ISecurityGroup;


  constructor(scope: Construct, id: string, props: GitlabRunnerAutoscalingProps) {
    super(scope, id);
    const token = props.gitlabToken;
    const tags = props.tags ?? ['gitlab', 'awscdk', 'runner'];
    const gitlabUrl = props.gitlabUrl ?? 'https://gitlab.com/';
    const instanceType = props.instanceType ?? 't3.micro';
    const userData = UserData.forLinux();
    userData.addCommands(
      'yum update -y ',
      'sleep 15 && yum install docker git -y && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock',
      'systemctl restart docker && systemctl enable docker',
      `docker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock \
      --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url ${gitlabUrl} --registration-token ${token} \
      --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" --executor docker --docker-image "alpine:latest" \
      --description "A Runner on EC2 Instance (${instanceType})" --tag-list "${tags.join(',')}" --docker-privileged`,
      'sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine',
      'usermod -aG docker ssm-user',
    );

    this.instanceRole =
      props.instanceRole ??
      new Role(this, 'GitlabRunnerInstanceRole', {
        assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
        description: 'For EC2 Instance (Gitlab Runner) Role',
      });
    this.instanceRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    );

    this.vpc = props.vpc ?? new Vpc(this, 'VPC');

    this.securityGroup = new SecurityGroup(this, 'GitlabRunnerSecurityGroup', {
      vpc: this.vpc,
    });

    this.autoscalingGroup = new AutoScalingGroup(this, 'GitlabRunnerAutoscalingGroup', {
      instanceType: new InstanceType(instanceType),
      autoScalingGroupName: `Gitlab Runners (${instanceType})`,
      vpc: this.vpc,
      vpcSubnets: props.vpcSubnet,
      machineImage: MachineImage.latestAmazonLinux({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      role: this.instanceRole,
      securityGroup: this.securityGroup,
      userData,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: BlockDeviceVolume.ebs(props.ebsSize ?? 60),
        },
      ],
      spotPrice: props.spotPrice,
      minCapacity: props.minCapacity,
      maxCapacity: props.maxCapacity,
      desiredCapacity: props.desiredCapacity,
    });

    const unregisterPolicy = new Policy(this, 'GitlabRunnerUnregisterPolicy', {
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: ['*'],
          actions: ['ssm:SendCommand'],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: ['*'],
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
          ],
        }),
      ],
    });

    const unregisterRole = new Role(this, 'GitlabRunnerUnregisterRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      description: 'For Gitlab Runner Unregistering Function Role',
    });
    unregisterRole.attachInlinePolicy(unregisterPolicy);

    const unregisterFunction = new lambda.Function(this, 'GitlabRunnerUnregisterFunction', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../getinstanceId')),
      handler: 'unregister_runner.unregister',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: Duration.seconds(60),
      role: unregisterRole,
    });

    this.autoscalingGroup.addLifecycleHook('GitlabRunnerLifeCycleHook', {
      lifecycleTransition: LifecycleTransition.INSTANCE_TERMINATING,
      notificationTarget: new FunctionHook(unregisterFunction),
      defaultResult: DefaultResult.CONTINUE,
      heartbeatTimeout: Duration.seconds(60),
    });

    new CfnOutput(this, 'GitlabRunnerAutoScalingGroupArn', {
      value: this.autoscalingGroup.autoScalingGroupArn,
    });
  }
}
