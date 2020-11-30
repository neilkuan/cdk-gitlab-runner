import * as path from 'path';
import * as asg from '@aws-cdk/aws-autoscaling';
import { FunctionHook } from '@aws-cdk/aws-autoscaling-hooktargets';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';
import { DockerVolumes } from './gitlab-runner-interfaces';

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
  readonly vpc?: ec2.IVpc;

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
  readonly instanceRole?: iam.IRole;

  /**
   * Run worker nodes as EC2 Spot
   *
   * @default - false
   */
  readonly spotInstance?: boolean;

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
  readonly vpcSubnet?: ec2.SubnetSelection;

  /**
   * add another Gitlab Container Runner Docker Volumes Path at job runner runtime.
   *
   * more detail see https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section
   *
   * @default - already mount "/var/run/docker.sock:/var/run/docker.sock"
   *
   * @example
   * dockerVolumes: [
   *   {
   *     hostPath: '/tmp/cache',
   *     containerPath: '/tmp/cache',
   *   },
   * ],
   */
  readonly dockerVolumes?: DockerVolumes[];
}

export class GitlabRunnerAutoscaling extends cdk.Construct {
  /**
   * The IAM role assumed by the Runner instance.
   */
  public readonly instanceRole: iam.IRole;

  /**
   * This represents a Runner Auto Scaling Group
   */
  public readonly autoscalingGroup: asg.AutoScalingGroup;

  /**
   * The EC2 runner's VPC.
   */
  public readonly vpc: ec2.IVpc;

  /**
   * The EC2 runner's default SecurityGroup.
   */
  public readonly securityGroup: ec2.ISecurityGroup;


  constructor(scope: cdk.Construct, id: string, props: GitlabRunnerAutoscalingProps) {
    super(scope, id);
    const token = props.gitlabToken;
    const tags = props.tags ?? ['gitlab', 'awscdk', 'runner'];
    const gitlabUrl = props.gitlabUrl ?? 'https://gitlab.com/';
    const instanceType = props.instanceType ?? 't3.micro';
    const userData = ec2.UserData.forLinux();

    userData.addCommands(
      'yum update -y ',
      'sleep 15 && yum install docker git -y && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock',
      'systemctl restart docker && systemctl enable docker',
      `docker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock \
      --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url ${gitlabUrl} --registration-token ${token} \
      --executor docker --docker-image "alpine:latest" \
      --description "A Runner on EC2 Instance (${instanceType})" --tag-list "${tags.join(',')}" --docker-privileged ${this.dockerVolumesList(props?.dockerVolumes)} `,
      'sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine',
      'usermod -aG docker ssm-user',
    );

    this.instanceRole =
      props.instanceRole ??
      new iam.Role(this, 'GitlabRunnerInstanceRole', {
        assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        description: 'For EC2 Instance (Gitlab Runner) Role',
      });
    this.instanceRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    );

    this.vpc = props.vpc ?? new ec2.Vpc(this, 'VPC');

    this.securityGroup = new ec2.SecurityGroup(this, 'GitlabRunnerSecurityGroup', {
      vpc: this.vpc,
    });
    const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [this.instanceRole.roleName],
    });
    const lt = new ec2.CfnLaunchTemplate(this, 'GitlabRunnerLaunchTemplate', {
      launchTemplateData: {
        imageId: ec2.MachineImage.latestAmazonLinux({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        }).getImage(this).imageId,
        instanceType: instanceType,
        instanceMarketOptions: {
          marketType: props.spotInstance ? 'spot' : undefined,
          spotOptions: props.spotInstance ? {
            spotInstanceType: 'one-time',
          } : undefined,
        },
        userData: cdk.Fn.base64(userData.render()),
        blockDeviceMappings: [
          {
            deviceName: '/dev/xvda',
            ebs: {
              volumeSize: props.ebsSize ?? 60,
            },
          },
        ],
        iamInstanceProfile: {
          arn: instanceProfile.attrArn,
        },
        securityGroupIds: this.securityGroup.connections.securityGroups.map(
          (m) => m.securityGroupId,
        ),
      },
    });

    this.autoscalingGroup = new asg.AutoScalingGroup(this, 'GitlabRunnerAutoscalingGroup', {
      instanceType: new ec2.InstanceType(instanceType),
      autoScalingGroupName: `Gitlab Runners (${instanceType})`,
      vpc: this.vpc,
      vpcSubnets: props.vpcSubnet,
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      minCapacity: props.minCapacity,
      maxCapacity: props.maxCapacity,
      desiredCapacity: props.desiredCapacity,
    });

    const cfnAsg = this.autoscalingGroup.node.tryFindChild('ASG') as asg.CfnAutoScalingGroup;
    cfnAsg.addPropertyDeletionOverride('LaunchConfigurationName');
    cfnAsg.addPropertyOverride('LaunchTemplate', {
      LaunchTemplateId: lt.ref,
      Version: lt.attrLatestVersionNumber,
    });
    this.autoscalingGroup.node.tryRemoveChild('LaunchConfig');

    const unregisterPolicy = new iam.Policy(this, 'GitlabRunnerUnregisterPolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: ['*'],
          actions: [
            'ssm:SendCommand',
            'autoscaling:DescribeAutoScalingGroups',
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
          ],
        }),
      ],
    });

    const unregisterRole = new iam.Role(this, 'GitlabRunnerUnregisterRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'For Gitlab Runner Unregistering Function Role',
    });
    unregisterRole.attachInlinePolicy(unregisterPolicy);

    // Lambda function to unregiser runners on terminating instance
    const unregisterFunction = new lambda.Function(this, 'GitlabRunnerUnregisterFunction', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets')),
      handler: 'autoscaling_events.unregister',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: cdk.Duration.seconds(60),
      role: unregisterRole,
      logRetention: logs.RetentionDays.ONE_DAY,
    });

    this.autoscalingGroup.addLifecycleHook('GitlabRunnerLifeCycleHook', {
      lifecycleTransition: asg.LifecycleTransition.INSTANCE_TERMINATING,
      notificationTarget: new FunctionHook(unregisterFunction),
      defaultResult: asg.DefaultResult.CONTINUE,
      heartbeatTimeout: cdk.Duration.seconds(60),
    });

    // Lambda function to unregiser runners on destroying stack
    const unregisterCustomResource = new lambda.Function(this, 'GitlabRunnerUnregisterCustomResource', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets')),
      handler: 'autoscaling_events.on_event',
      runtime: lambda.Runtime.PYTHON_3_8,
      role: unregisterRole,
      logRetention: logs.RetentionDays.ONE_DAY,
    });

    const unregisterProvider = new cr.Provider(this, 'GitlabRunnerUnregisterProvider', {
      onEventHandler: unregisterCustomResource,
    });

    const customResource = new cdk.CustomResource(this, 'GitlabRunnerCustomResource', {
      serviceToken: unregisterProvider.serviceToken,
      properties: {
        AutoScalingGroupNames: [this.autoscalingGroup.autoScalingGroupName],
      },
    });
    customResource.node.addDependency(unregisterProvider);

    new cdk.CfnOutput(this, 'GitlabRunnerAutoScalingGroupArn', {
      value: this.autoscalingGroup.autoScalingGroupArn,
    });
  }
  private dockerVolumesList(dockerVolume: DockerVolumes[] | undefined): string {
    let tempString :string = '--docker-volumes "/var/run/docker.sock:/var/run/docker.sock"';
    if (dockerVolume) {
      let tempList :string[] = [];
      dockerVolume.forEach(e => {
        tempList.push(`"${e.hostPath}:${e.containerPath}"`);
      });
      tempList.forEach(e => {
        tempString = `${tempString} --docker-volumes ${e}`;
      });
    }
    return tempString;
  }
}
