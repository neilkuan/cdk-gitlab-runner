import * as path from 'path';
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
import {
  IRole,
  Role,
  ServicePrincipal,
  ManagedPolicy,
  CfnInstanceProfile,
  PolicyStatement,
} from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import { Bucket } from '@aws-cdk/aws-s3';
import {
  Construct,
  CfnOutput,
  Fn,
  Stack,
  Duration,
  Lazy,
  CustomResource,
  Token,
  RemovalPolicy,
} from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';

import { DockerVolumes } from './gitlab-runner-interfaces';
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
   * @deprecated - use tags ['runner', 'gitlab', 'awscdk']
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
   * @deprecated - use tags ['runner', 'gitlab', 'awscdk']
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
   * @deprecated - use tags ['runner', 'gitlab', 'awscdk']
   *
   * @default - tag3: runner .
   *
   */
  readonly tag3?: string;

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
   * const runner = new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN',gitlaburl: 'https://gitlab.com/'});
   *
   * @default - gitlaburl='https://gitlab.com/' , please use https://yourgitlab.com/ do not use https://yourgitlab.com
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
   * This represents a Runner EC2 instance , !!! only support On-demand runner instance !!!
   */
  public readonly runnerEc2!: IInstance;

  /**
   * The EC2 runner's vpc.
   */
  public readonly vpc!: IVpc;

  /**
   * The time when the the fleet allocation will expire , !!! only support spotfleet runner !!!
   */
  private validUntil?: string;

  /**
   * The EC2 runner's default SecurityGroup.
   */
  public readonly defaultRunnerSG!: ISecurityGroup;

  /**
   * SpotFleetRequestId for this spot fleet , !!! only support spotfleet runner !!!
   */
  public readonly spotFleetRequestId!: string;

  /**
   * the first instance id in this fleet , !!! only support spotfleet runner !!!
   */
  readonly spotFleetInstanceId!: string;

  constructor(scope: Construct, id: string, props: GitlabContainerRunnerProps) {
    super(scope, id);
    const spotFleetId = id;

    const defaultProps = {
      gitlabRunnerImage: 'public.ecr.aws/gitlab/gitlab-runner:alpine',
      gitlaburl: 'https://gitlab.com/',
      ec2type: 't3.micro',
      tags: ['gitlab', 'awscdk', 'runner'],
    };
    const runnerProps = { ...defaultProps, ...props };

    const runnerBucket = new Bucket(this, 'runnerBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const shell = UserData.forLinux();
    shell.addCommands(...this.createUserData(runnerProps, runnerBucket.bucketName));

    this.runnerRole =
      runnerProps.ec2iamrole ??
      new Role(this, 'runner-role', {
        assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
        description: 'For Gitlab EC2 Runner Role',
      });
    this.validUntil = runnerProps.validUntil;
    const instanceProfile = new CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [this.runnerRole.roleName],
    });
    runnerBucket.grantWrite(this.runnerRole);
    this.vpc =
      runnerProps.selfvpc ??
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
    const spotOrOnDemand = runnerProps.spotFleet ?? false;
    if (spotOrOnDemand) {
      //throw new Error('yes new spotfleet');

      const imageId = MachineImage.latestAmazonLinux({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }).getImage(this).imageId;
      const lt = new CfnLaunchTemplate(this, 'LaunchTemplate', {
        launchTemplateData: {
          imageId,
          instanceType: runnerProps.ec2type,
          blockDeviceMappings: [
            {
              deviceName: '/dev/xvda',
              ebs: {
                volumeSize: runnerProps.ebsSize ?? 60,
              },
            },
          ],
          userData: Fn.base64(shell.render()),
          keyName: runnerProps.keyName,
          tagSpecifications: [
            {
              resourceType: 'instance',
              tags: [
                {
                  key: 'Name',
                  value: `${Stack.of(this).stackName
                  }/spotFleetGitlabRunner/${spotFleetId}`,
                },
              ],
            },
          ],
          instanceMarketOptions: {
            marketType: 'spot',
            spotOptions: {
              blockDurationMinutes:
                runnerProps.blockDuration ?? BlockDuration.ONE_HOUR,
              instanceInterruptionBehavior:
                runnerProps.instanceInterruptionBehavior ??
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

      const vpcSubnetSelection = runnerProps.vpcSubnet ?? {
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
        code: lambda.Code.fromAsset(path.join(__dirname, '../assets/functions')),
        handler: 'index.on_event',
        runtime: lambda.Runtime.PYTHON_3_8,
        timeout: Duration.seconds(60),
      });

      const isComplete = new lambda.Function(this, 'IsComplete', {
        code: lambda.Code.fromAsset(path.join(__dirname, '../assets/functions')),
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
        instanceType: new InstanceType(runnerProps.ec2type),
        instanceName: 'Gitlab-Runner',
        vpc: this.vpc,
        vpcSubnets: runnerProps.vpcSubnet ?? {
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
            volume: BlockDeviceVolume.ebs(runnerProps.ebsSize ?? 60),
          },
        ],
      });
      new CfnOutput(this, 'Runner-Instance-ID', {
        value: this.runnerEc2.instanceId,
      });
    }

    const unregisterRunnerOnEvent = new lambda.Function(this, 'unregisterRunnerOnEvent', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets/functions')),
      handler: 'unregister_runner.on_event',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: Duration.seconds(60),
    });

    const unregisterRunnerProvider = new cr.Provider(this, 'unregisterRunnerProvider', {
      onEventHandler: unregisterRunnerOnEvent,
      logRetention: logs.RetentionDays.ONE_DAY,
    });

    const unregisterRunnerCR = new CustomResource(this, 'unregisterRunnerCR', {
      resourceType: 'Custom::unregisterRunnerProvider',
      serviceToken: unregisterRunnerProvider.serviceToken,
      properties: {
        BucketName: runnerBucket.bucketName,
        GitlabUrl: runnerProps.gitlaburl,
      },
    });

    runnerBucket.grantReadWrite(unregisterRunnerOnEvent);
    unregisterRunnerCR.node.addDependency(runnerBucket);
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

  public createUserData(props: GitlabContainerRunnerProps, bucketName: string): string[] {
    return [
      'yum update -y ',
      'sleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock',
      'systemctl restart docker && systemctl enable docker',
      `docker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock \
      --name gitlab-runner-register ${props.gitlabRunnerImage} register --non-interactive --url ${props.gitlaburl} --registration-token ${props.gitlabtoken} \
      --docker-pull-policy if-not-present ${this.dockerVolumesList(props?.dockerVolumes)} \
      --executor docker --docker-image "alpine:latest" --description "Docker Runner" \
      --tag-list "${props.tags?.join(',')}" --docker-privileged`,
      `sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner ${props.gitlabRunnerImage}`,
      `TOKEN=$(cat /home/ec2-user/.gitlab-runner/config.toml | grep token | cut -d '"' -f 2) && echo '{"token": "TOKEN"}' > /tmp/runnertoken.txt && sed -i s/TOKEN/$TOKEN/g /tmp/runnertoken.txt && aws s3 cp /tmp/runnertoken.txt s3://${bucketName}`,
    ];
  }
}
