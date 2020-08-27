import {
  Construct,
  CfnOutput,
  Fn,
  Stack,
  Duration,
  Lazy,
  CustomResource,
  Token,
} from '@aws-cdk/core';
import {
  IRole,
  Role,
  ServicePrincipal,
  ManagedPolicy,
  CfnInstanceProfile,
  PolicyStatement,
} from '@aws-cdk/aws-iam';
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
  SecurityGroup,
  Port,
  CfnLaunchTemplate,
  CfnSpotFleet,
  ISecurityGroup,
  SubnetSelection,
} from '@aws-cdk/aws-ec2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import * as path from 'path';
import * as cr from '@aws-cdk/custom-resources';

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

  /**
   * Gitlab Runner instance Use Spot Fleet or not ?!.
   *
   * @example
   * const runner = new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN',spotFleet: true});
   *
   * @default - spotFleet=false
   *
   */
  readonly spotFleet?: boolean;

  /**
   * SSH key name
   *
   * @default - no ssh key will be assigned , !!! only support spotfleet runner !!! .
   */
  readonly keyName?: string;

  /**
   * Reservce the Spot Runner instance as spot block with defined duration
   *
   * @default - BlockDuration.ONE_HOUR , !!! only support spotfleet runner !!! .
   */
  readonly blockDuration?: BlockDuration;

  /**
   * The behavior when a Spot Runner Instance is interrupted
   *
   * @default - InstanceInterruptionBehavior.TERMINATE , !!! only support spotfleet runner !!! .
   */
  readonly instanceInterruptionBehavior?: InstanceInterruptionBehavior;

  /**
   * the time when the spot fleet allocation expires
   *
   * @default - no expiration , !!! only support spotfleet runner !!! .
   */
  readonly validUntil?: string;

  /**
   * VPC subnet for the spot fleet
   *
   * @example
   * const vpc = new Vpc(stack, 'nat', {
   * natGateways: 1,
   * maxAzs: 2,
   * });
   * const runner = new GitlabContainerRunner(stack, 'testing', {
   *   gitlabtoken: 'GITLAB_TOKEN',
   *   ec2type: 't3.large',
   *   ec2iamrole: role,
   *   ebsSize: 100,
   *   selfvpc: vpc,
   *   vpcSubnet: {
   *     subnetType: SubnetType.PUBLIC,
   *   },
   * });
   *
   * @default - public subnet
   */
  readonly vpcSubnet?: SubnetSelection;
}

export enum BlockDuration {
  ONE_HOUR = 60,
  TWO_HOURS = 120,
  THREE_HOURS = 180,
  FOUR_HOURS = 240,
  FIVE_HOURS = 300,
  SIX_HOURS = 360,
  SEVEN_HOURS = 420,
  EIGHT_HOURS = 480,
  NINE_HOURS = 540,
  TEN_HOURS = 600,
  ELEVEN_HOURS = 660,
  TWELVE_HOURS = 720,
  THIRTEEN_HOURS = 780,
  FOURTEEN_HOURS = 840,
  FIFTEEN_HOURS = 900,
  SIXTEEN_HOURS = 960,
  SEVENTEEN_HOURS = 1020,
  EIGHTTEEN_HOURS = 1080,
  NINETEEN_HOURS = 1140,
  TWENTY_HOURS = 1200,
}

export enum InstanceInterruptionBehavior {
  HIBERNATE = 'hibernate',
  STOP = 'stop',
  TERMINATE = 'terminate',
}

export class GitlabContainerRunner extends Construct {
  /**
   * The IAM role assumed by the Runner instance .
   */
  public readonly runnerRole: IRole;

  /**
   * This represents a Runner EC2 instance , !!! only support On-demand runner instance !!! .
   */
  public readonly runnerEc2!: IInstance;

  public readonly vpc!: IVpc;

  /**
   * The time when the the fleet allocation will expire , !!! only support spotfleet runner !!! .
   */
  private validUntil?: string;

  public readonly defaultRunnerSG!: ISecurityGroup;

  /**
   * SpotFleetRequestId for this spot fleet , !!! only support spotfleet runner !!! .
   */
  public readonly spotFleetRequestId!: string;

  /**
   * the first instance id in this fleet , !!! only support spotfleet runner !!! .
   */
  readonly spotFleetInstanceId!: string;

  constructor(scope: Construct, id: string, props: GitlabContainerRunnerProps) {
    super(scope, id);
    const spotFleetId = id;
    const token = props.gitlabtoken;
    const tag1 = props.tag1 ?? 'gitlab';
    const tag2 = props.tag2 ?? 'awscdk';
    const tag3 = props.tag3 ?? 'runner';
    const gitlaburl = props.gitlaburl ?? 'https://gitlab.com/';
    const ec2type = props.ec2type ?? 't3.micro';
    const shell = UserData.forLinux();
    shell.addCommands(
      'yum update -y ',
      'sleep 15 && yum install docker git -y && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock',
      'systemctl restart docker && systemctl enable docker',
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
        '" --docker-privileged',

      'sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine',
      'usermod -aG docker ssm-user',
    );

    this.runnerRole =
      props.ec2iamrole ??
      new Role(this, 'runner-role', {
        assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
        description: 'For Gitlab EC2 Runner Role',
      });
    this.validUntil = props.validUntil;
    const instanceProfile = new CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [this.runnerRole.roleName],
    });

    this.vpc =
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
    this.defaultRunnerSG = new SecurityGroup(this, 'SpotFleetSg', {
      vpc: this.vpc,
    });
    this.defaultRunnerSG.connections.allowFromAnyIpv4(Port.tcp(22));
    const spotOrOnDemand = props.spotFleet ?? false;
    if (spotOrOnDemand) {
      //throw new Error('yes new spotfleet');

      const imageId = MachineImage.latestAmazonLinux({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }).getImage(this).imageId;
      const lt = new CfnLaunchTemplate(this, 'LaunchTemplate', {
        launchTemplateData: {
          imageId,
          instanceType: ec2type,
          blockDeviceMappings: [
            {
              deviceName: '/dev/xvda',
              ebs: {
                volumeSize: props.ebsSize ?? 60,
              },
            },
          ],
          userData: Fn.base64(shell.render()),
          keyName: props.keyName,
          tagSpecifications: [
            {
              resourceType: 'instance',
              tags: [
                {
                  key: 'Name',
                  value: `${
                    Stack.of(this).stackName
                  }/spotFleetGitlabRunner/${spotFleetId}`,
                },
              ],
            },
          ],
          instanceMarketOptions: {
            marketType: 'spot',
            spotOptions: {
              blockDurationMinutes:
                props.blockDuration ?? BlockDuration.ONE_HOUR,
              instanceInterruptionBehavior:
                props.instanceInterruptionBehavior ??
                InstanceInterruptionBehavior.TERMINATE,
            },
          },
          securityGroupIds: this.defaultRunnerSG.connections.securityGroups.map(
            (m) => m.securityGroupId,
          ),
          iamInstanceProfile: {
            arn: instanceProfile.attrArn,
          },
        },
      });

      const spotFleetRole = new Role(this, 'FleetRole', {
        assumedBy: new ServicePrincipal('spotfleet.amazonaws.com'),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AmazonEC2SpotFleetTaggingRole',
          ),
        ],
      });

      const vpcSubnetSelection = props.vpcSubnet ?? {
        subnetType: SubnetType.PUBLIC,
      };
      const subnetConfig = this.vpc
        .selectSubnets(vpcSubnetSelection)
        .subnets.map((s) => ({
          subnetId: s.subnetId,
        }));

      const cfnSpotFleet = new CfnSpotFleet(this, id, {
        spotFleetRequestConfigData: {
          launchTemplateConfigs: [
            {
              launchTemplateSpecification: {
                launchTemplateId: lt.ref,
                version: lt.attrLatestVersionNumber,
              },
              overrides: subnetConfig,
            },
          ],
          iamFleetRole: spotFleetRole.roleArn,
          targetCapacity: 1,
          validUntil: Lazy.stringValue({ produce: () => this.validUntil }),
          terminateInstancesWithExpiration: true,
        },
      });
      const onEvent = new lambda.Function(this, 'OnEvent', {
        code: lambda.Code.fromAsset(path.join(__dirname, './')),
        handler: 'index.on_event',
        runtime: lambda.Runtime.PYTHON_3_8,
        timeout: Duration.seconds(60),
      });

      const isComplete = new lambda.Function(this, 'IsComplete', {
        code: lambda.Code.fromAsset(path.join(__dirname, './')),
        handler: 'index.is_complete',
        runtime: lambda.Runtime.PYTHON_3_8,
        timeout: Duration.seconds(60),
        role: onEvent.role,
      });

      const myProvider = new cr.Provider(this, 'MyProvider', {
        onEventHandler: onEvent,
        isCompleteHandler: isComplete,
        logRetention: logs.RetentionDays.ONE_DAY,
      });

      onEvent.addToRolePolicy(
        new PolicyStatement({
          actions: ['ec2:DescribeSpotFleetInstances'],
          resources: ['*'],
        }),
      );

      const fleetInstances = new CustomResource(this, 'GetInstanceId', {
        serviceToken: myProvider.serviceToken,
        properties: {
          SpotFleetRequestId: cfnSpotFleet.ref,
        },
      });

      fleetInstances.node.addDependency(cfnSpotFleet);
      this.spotFleetInstanceId = Token.asString(
        fleetInstances.getAtt('InstanceId'),
      );
      this.spotFleetRequestId = Token.asString(
        fleetInstances.getAtt('SpotInstanceRequestId'),
      );
      new CfnOutput(this, 'InstanceId', { value: this.spotFleetInstanceId });
      new CfnOutput(this, 'SpotFleetId', { value: cfnSpotFleet.ref });
    } else {
      this.runnerEc2 = new Instance(this, 'GitlabRunner', {
        instanceType: new InstanceType(ec2type),
        instanceName: 'Gitlab-Runner',
        vpc: this.vpc,
        vpcSubnets: props.vpcSubnet ?? {
          subnetType: SubnetType.PUBLIC,
        },
        machineImage: MachineImage.latestAmazonLinux({
          generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        role: this.runnerRole,
        userData: shell,
        securityGroup: this.defaultRunnerSG,
        blockDevices: [
          {
            deviceName: '/dev/xvda',
            volume: BlockDeviceVolume.ebs(props.ebsSize ?? 60),
          },
        ],
      });
      new CfnOutput(this, 'Runner-Instance-ID', {
        value: this.runnerEc2.instanceId,
      });
    }
    this.runnerRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    );

    new CfnOutput(this, 'Runner-Role-Arn', {
      value: this.runnerRole.roleArn,
    });
  }

  /**
   * @default - !!! only support spotfleet runner !!! .
   */
  public expireAfter(duration: Duration) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + duration.toSeconds());
    this.validUntil = date.toISOString();
  }
}
