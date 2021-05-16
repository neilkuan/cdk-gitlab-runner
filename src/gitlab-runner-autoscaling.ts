import * as path from 'path';
import * as asg from '@aws-cdk/aws-autoscaling';
import { FunctionHook } from '@aws-cdk/aws-autoscaling-hooktargets';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import * as assets from '@aws-cdk/aws-s3-assets';
import * as sns from '@aws-cdk/aws-sns';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
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
   * Image URL of Gitlab Runner.
   *
   * @example
   * new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', gitlabRunnerImage: 'gitlab/gitlab-runner:alpine' });
   *
   * @default public.ecr.aws/gitlab/gitlab-runner:alpine
   *
   */
  readonly gitlabRunnerImage?: string;

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

  /**
   * Parameters of put_metric_alarm function
   *
   * https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/cloudwatch.html#CloudWatch.Client.put_metric_alarm
   *
   * @default - [{
   *     AlarmName: 'GitlabRunnerDiskUsage',
   *     MetricName: 'disk_used_percent',
   * }]
   *
   */
  readonly alarms?: object[];
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

  /**
   * The SNS topic to suscribe alarms for EC2 runner's metrics.
   */
  public readonly topicAlarm: sns.ITopic;


  constructor(scope: cdk.Construct, id: string, props: GitlabRunnerAutoscalingProps) {
    super(scope, id);
    const defaultProps = {
      instanceType: 't3.micro',
      tags: ['gitlab', 'awscdk', 'runner'],
      gitlabUrl: 'https://gitlab.com/',
      gitlabRunnerImage: 'public.ecr.aws/gitlab/gitlab-runner:alpine',
      alarms: [
        {
          AlarmName: 'GitlabRunnerDiskUsage',
          MetricName: 'disk_used_percent',
        },
      ],
    };
    const runnerProps = { ...defaultProps, ...props };

    const asset = new assets.Asset(this, 'GitlabRunnerUserDataAsset', {
      path: path.join(__dirname, '../assets/userdata/amazon-cloudwatch-agent.json'),
    });

    const userData = ec2.UserData.forLinux();
    userData.addS3DownloadCommand({
      bucket: asset.bucket,
      bucketKey: asset.s3ObjectKey,
      localFile: '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json',
    });
    userData.addCommands(...this.createUserData(runnerProps));

    this.instanceRole =
      runnerProps.instanceRole ??
      new iam.Role(this, 'GitlabRunnerInstanceRole', {
        assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        description: 'For EC2 Instance (Gitlab Runner) Role',
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
          iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
          iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
        ],
      });

    this.vpc = runnerProps.vpc ?? new ec2.Vpc(this, 'VPC');

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
        instanceType: runnerProps.instanceType,
        instanceMarketOptions: {
          marketType: runnerProps.spotInstance ? 'spot' : undefined,
          spotOptions: runnerProps.spotInstance ? {
            spotInstanceType: 'one-time',
          } : undefined,
        },
        userData: cdk.Fn.base64(userData.render()),
        blockDeviceMappings: [
          {
            deviceName: '/dev/xvda',
            ebs: {
              volumeSize: runnerProps.ebsSize ?? 60,
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
      instanceType: new ec2.InstanceType(runnerProps.instanceType),
      autoScalingGroupName: `Gitlab Runners (${runnerProps.instanceType})`,
      vpc: this.vpc,
      vpcSubnets: runnerProps.vpcSubnet,
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      minCapacity: runnerProps.minCapacity,
      maxCapacity: runnerProps.maxCapacity,
      desiredCapacity: runnerProps.desiredCapacity,
    });

    const cfnAsg = this.autoscalingGroup.node.tryFindChild('ASG') as asg.CfnAutoScalingGroup;
    cfnAsg.addPropertyDeletionOverride('LaunchConfigurationName');
    cfnAsg.addPropertyOverride('LaunchTemplate', {
      LaunchTemplateId: lt.ref,
      Version: lt.attrLatestVersionNumber,
    });
    this.autoscalingGroup.node.tryRemoveChild('LaunchConfig');

    this.topicAlarm = new sns.Topic(this, 'GitlabRunnerAlarm');
    const alarms = JSON.stringify(runnerProps.alarms);

    // Put alarms at launch
    const registerFunction = new lambda.Function(this, 'GitlabRunnerRegisterFunction', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets/functions')),
      handler: 'autoscaling_events.register',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: cdk.Duration.seconds(60),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        ALARMS: alarms,
        SNS_TOPIC_ARN: this.topicAlarm.topicArn,
      },
    });
    registerFunction.role?.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: [
          'cloudwatch:PutMetricAlarm',
        ],
      }),
    );

    this.autoscalingGroup.addLifecycleHook('GitlabRunnerLifeCycleHookLaunching', {
      lifecycleTransition: asg.LifecycleTransition.INSTANCE_LAUNCHING,
      notificationTarget: new FunctionHook(registerFunction),
      defaultResult: asg.DefaultResult.CONTINUE,
      heartbeatTimeout: cdk.Duration.seconds(60),
    });

    // Add an alarm action to terminate invalid instances
    const alarmAction = new lambda.Function(this, 'GitlabRunnerAlarmAction', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets/functions')),
      handler: 'autoscaling_events.on_alarm',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: cdk.Duration.seconds(60),
      logRetention: logs.RetentionDays.ONE_DAY,
    });
    alarmAction.role?.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: [
          'autoscaling:SetInstanceHealth',
        ],
      }),
    );
    const alarmSubscription = new subscriptions.LambdaSubscription(alarmAction);
    this.topicAlarm.addSubscription(alarmSubscription);

    // Unregister gitlab runners and remove alarms on instance termination or CFn stack deletion
    const unregisterRole = new iam.Role(this, 'GitlabRunnerUnregisterRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'For Gitlab Runner Unregistering Function Role',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });
    unregisterRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: [
          'ssm:SendCommand',
          'autoscaling:DescribeAutoScalingGroups',
          'cloudwatch:DeleteAlarms',
        ],
      }),
    );

    const unregisterFunction = new lambda.Function(this, 'GitlabRunnerUnregisterFunction', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets/functions')),
      handler: 'autoscaling_events.unregister',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: cdk.Duration.seconds(60),
      role: unregisterRole,
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        ALARMS: alarms,
      },
    });

    this.autoscalingGroup.addLifecycleHook('GitlabRunnerLifeCycleHookTerminating', {
      lifecycleTransition: asg.LifecycleTransition.INSTANCE_TERMINATING,
      notificationTarget: new FunctionHook(unregisterFunction),
      defaultResult: asg.DefaultResult.CONTINUE,
      heartbeatTimeout: cdk.Duration.seconds(60),
    });

    const unregisterCustomResource = new lambda.Function(this, 'GitlabRunnerUnregisterCustomResource', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets/functions')),
      handler: 'autoscaling_events.on_event',
      runtime: lambda.Runtime.PYTHON_3_8,
      role: unregisterRole,
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        ALARMS: alarms,
      },
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
    let tempString: string = '--docker-volumes "/var/run/docker.sock:/var/run/docker.sock"';
    if (dockerVolume) {
      let tempList: string[] = [];
      dockerVolume.forEach(e => {
        tempList.push(`"${e.hostPath}:${e.containerPath}"`);
      });
      tempList.forEach(e => {
        tempString = `${tempString} --docker-volumes ${e}`;
      });
    }
    return tempString;
  }

  public createUserData(props: GitlabRunnerAutoscalingProps): string[] {
    return [
      'yum update -y',
      'sleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock',
      'systemctl restart docker && systemctl enable docker && systemctl start amazon-cloudwatch-agent && systemctl enable amazon-cloudwatch-agent',
      `docker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock \
      --name gitlab-runner-register ${props.gitlabRunnerImage} register --non-interactive --url ${props.gitlabUrl} --registration-token ${props.gitlabToken} \
      --docker-pull-policy if-not-present ${this.dockerVolumesList(props?.dockerVolumes)} \
      --executor docker --docker-image "alpine:latest" --description "A Runner on EC2 Instance (${props.instanceType})" \
      --tag-list "${props.tags?.join(',')}" --docker-privileged`,
      `sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner ${props.gitlabRunnerImage}`,
    ];
  }
}
