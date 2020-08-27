import { Construct, Duration } from '@aws-cdk/core';
import { IRole } from '@aws-cdk/aws-iam';
import { IVpc, IInstance, ISecurityGroup, SubnetSelection } from '@aws-cdk/aws-ec2';
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
export declare enum BlockDuration {
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
    TWENTY_HOURS = 1200
}
export declare enum InstanceInterruptionBehavior {
    HIBERNATE = "hibernate",
    STOP = "stop",
    TERMINATE = "terminate"
}
export declare class GitlabContainerRunner extends Construct {
    /**
     * The IAM role assumed by the Runner instance .
     */
    readonly runnerRole: IRole;
    /**
     * This represents a Runner EC2 instance , !!! only support On-demand runner instance !!! .
     */
    readonly runnerEc2: IInstance;
    readonly vpc: IVpc;
    /**
     * The time when the the fleet allocation will expire , !!! only support spotfleet runner !!! .
     */
    private validUntil?;
    readonly defaultRunnerSG: ISecurityGroup;
    /**
     * SpotFleetRequestId for this spot fleet , !!! only support spotfleet runner !!! .
     */
    readonly spotFleetRequestId: string;
    /**
     * the first instance id in this fleet , !!! only support spotfleet runner !!! .
     */
    readonly spotFleetInstanceId: string;
    constructor(scope: Construct, id: string, props: GitlabContainerRunnerProps);
    /**
     * @default - !!! only support spotfleet runner !!! .
     */
    expireAfter(duration: Duration): void;
}
