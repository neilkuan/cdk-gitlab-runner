import * as path from 'path';
import {
  CfnOutput,
  Fn,
  Stack,
  Duration,
  Lazy,
  CustomResource,
  Token,
  Annotations,
} from 'aws-cdk-lib';
import {
  Instance,
  InstanceType,
  MachineImage,
  UserData,
  BlockDeviceVolume,
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
  IpAddresses,
} from 'aws-cdk-lib/aws-ec2';
import {
  IRole,
  Role,
  ServicePrincipal,
  ManagedPolicy,
  CfnInstanceProfile,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as cr from 'aws-cdk-lib/custom-resources';
// eslint-disable-next-line import/no-extraneous-dependencies
import { compare } from 'compare-versions';
import { Construct } from 'constructs';

import { DockerVolumes } from './gitlab-runner-interfaces';
/**
 * GitlabContainerRunner Props.
 */
export interface GitlabContainerRunnerProps {
  /**
   * Gitlab Runner version
   * Please give me gitlab runner version.
   */
  readonly gitlabRunnerVersion: string;
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
   * @default public.ecr.aws/gitlab/gitlab-runner:latest !!! <--- latest now > 16.0 Gitlab Runner version
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
   *   ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
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
   * tags for the runner
   * Unsupported Gitlab Runner 15.10 and later
   * @see - https://docs.gitlab.com/ee/ci/runners/new_creation_workflow.html
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
   * Gitlab Runner concurrent job configuration.
   *
   * @example
   * const runner = new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN',concurrentJobs: 3});
   *
   * @default - concurrentJobs=1
   */
  readonly concurrentJobs?: number;

  /**
   * Gitlab Runner description.
   *
   * @example
   * const runner = new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN',runnerDescription: 'Simple GitLab Runner'});
   *
   * @default - runnerDescription='Docker Runner'
   */
  readonly runnerDescription?: string;

  /**
   * SSH key name
   *
   * @default - no ssh key will be assigned , !!! only support spotfleet runner !!! .
   */
  readonly keyName?: string;

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

/**
 * InstanceInterruptionBehavior enum.
 */
export enum InstanceInterruptionBehavior {
  /**
   * hibernate
   */
  HIBERNATE = 'hibernate',
  /**
   * stop
   */
  STOP = 'stop',
  /**
   * terminate
   */
  TERMINATE = 'terminate',
}

/**
 * GitlabContainerRunner Construct for create a Gitlab Runner.
 */
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

  private cfnSpotFleet?: CfnSpotFleet;
  constructor(scope: Construct, id: string, props: GitlabContainerRunnerProps) {
    super(scope, id);
    if (!props.gitlabRunnerImage) {
      Annotations.of(this).addWarning('Default Gitlab Runner Image use public.ecr.aws/gitlab/gitlab-runner:latest GitlabRunner Version Maybe > 16.0');
    }

    const spotFleetId = id;

    const defaultProps = {
      gitlabRunnerImage: 'public.ecr.aws/gitlab/gitlab-runner:latest',
      gitlaburl: 'https://gitlab.com/',
      ec2type: 't3.micro',
      tags: ['gitlab', 'awscdk', 'runner'],
      concurrentJobs: 1,
      runnerDescription: 'Docker Runner',
    };

    const runnerProps = { ...defaultProps, ...props };
    if (compare(props.gitlabRunnerVersion, '15.10', '>=') && props.gitlabtoken.includes('glrt-') === false) {
      throw new Error('If gitlabRunnerVersion >= 15.10, gitlabtoken please give glrt-xxxxxxx @see https://docs.gitlab.com/ee/ci/runners/new_creation_workflow.html');
    }

    const tokenParameterStore = new ssm.StringParameter(this, 'GitlabTokenParameter', {
      stringValue: 'GITLAB_TOKEN',
    });

    const shell = UserData.forLinux();
    shell.addCommands(...this.createUserData(runnerProps, tokenParameterStore.parameterName));

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
    tokenParameterStore.grantWrite(this.runnerRole);
    tokenParameterStore.grantRead(this.runnerRole);
    this.vpc =
      runnerProps.selfvpc ??
      new Vpc(this, 'VPC', {
        ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
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
      //--token Error('yes new spotfleet');

      const imageId = MachineImage.latestAmazonLinux2().getImage(this).imageId;
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

      this.cfnSpotFleet = new CfnSpotFleet(this, id, {
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
          validUntil: Lazy.string({ produce: () => this.validUntil }),
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

      const fleetInstancesId = new CustomResource(this, 'GetInstanceId', {
        serviceToken: myProvider.serviceToken,
        properties: {
          SpotFleetRequestId: this.cfnSpotFleet.ref,
        },
      });

      fleetInstancesId.node.addDependency(this.cfnSpotFleet);
      this.spotFleetInstanceId = Token.asString(
        fleetInstancesId.getAtt('InstanceId'),
      );
      this.spotFleetRequestId = Token.asString(
        fleetInstancesId.getAtt('SpotInstanceRequestId'),
      );
      new CfnOutput(this, 'InstanceId', { value: this.spotFleetInstanceId });
      new CfnOutput(this, 'SpotFleetId', { value: this.cfnSpotFleet.ref });
    } else {
      this.runnerEc2 = new Instance(this, 'GitlabRunner', {
        instanceType: new InstanceType(runnerProps.ec2type),
        instanceName: 'Gitlab-Runner',
        vpc: this.vpc,
        vpcSubnets: runnerProps.vpcSubnet ?? {
          subnetType: SubnetType.PUBLIC,
        },
        machineImage: MachineImage.latestAmazonLinux2(),
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
        TokenParameterStoreName: tokenParameterStore.parameterName,
        GitlabUrl: runnerProps.gitlaburl,
      },
    });

    tokenParameterStore.grantRead(unregisterRunnerOnEvent);
    unregisterRunnerCR.node.addDependency(tokenParameterStore);
    this.runnerRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    );

    new CfnOutput(this, 'Runner-Role-Arn', {
      value: this.runnerRole.roleArn,
    });
  }

  /**
   * Add expire time function for spotfleet runner !!! .
   *
   * @param duration - Block duration.
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
  /**
   * @param props
   * @param tokenParameterStoreName - the tokenParameterStoreName to put gitlab runner token.
   * @returns Array.
   */
  public createUserData(props: GitlabContainerRunnerProps, tokenParameterStoreName: string): string[] {
    return [
      'yum update -y ',
      'sleep 15 && amazon-linux-extras install docker && yum install -y amazon-cloudwatch-agent && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock',
      'systemctl restart docker && systemctl enable docker',
      `docker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock \
      --name gitlab-runner-register ${props.gitlabRunnerImage} register --non-interactive --url ${props.gitlaburl} ${compare(props.gitlabRunnerVersion, '15.10', '>=') ? '--token' : '--registration-token'} ${props.gitlabtoken} \
      --docker-pull-policy if-not-present ${this.dockerVolumesList(props?.dockerVolumes)} \
      --executor docker --docker-image "alpine:latest" --description "${props.runnerDescription}" \
      ${compare(props.gitlabRunnerVersion, '15.10', '>=') ? undefined :`--tag-list "${props.tags?.join(',')}" `} --docker-privileged`,
      `sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner ${props.gitlabRunnerImage}`,
      `sed -i 's/concurrent = .*/concurrent = ${props.concurrentJobs}/g' /home/ec2-user/.gitlab-runner/config.toml`,
      'TOKEN=$(cat /home/ec2-user/.gitlab-runner/config.toml | grep \'token \' | awk \'{print $3}\'| tr -d \'"\')',
      `aws ssm put-parameter --name ${tokenParameterStoreName} --value $TOKEN --overwrite --region ${Stack.of(this).region}`,
    ];
  }
}
