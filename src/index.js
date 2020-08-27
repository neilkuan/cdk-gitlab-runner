"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitlabContainerRunner = exports.InstanceInterruptionBehavior = exports.BlockDuration = void 0;
const core_1 = require("@aws-cdk/core");
const aws_iam_1 = require("@aws-cdk/aws-iam");
const aws_ec2_1 = require("@aws-cdk/aws-ec2");
const lambda = require("@aws-cdk/aws-lambda");
const logs = require("@aws-cdk/aws-logs");
const path = require("path");
const cr = require("@aws-cdk/custom-resources");
var BlockDuration;
(function (BlockDuration) {
    BlockDuration[BlockDuration["ONE_HOUR"] = 60] = "ONE_HOUR";
    BlockDuration[BlockDuration["TWO_HOURS"] = 120] = "TWO_HOURS";
    BlockDuration[BlockDuration["THREE_HOURS"] = 180] = "THREE_HOURS";
    BlockDuration[BlockDuration["FOUR_HOURS"] = 240] = "FOUR_HOURS";
    BlockDuration[BlockDuration["FIVE_HOURS"] = 300] = "FIVE_HOURS";
    BlockDuration[BlockDuration["SIX_HOURS"] = 360] = "SIX_HOURS";
    BlockDuration[BlockDuration["SEVEN_HOURS"] = 420] = "SEVEN_HOURS";
    BlockDuration[BlockDuration["EIGHT_HOURS"] = 480] = "EIGHT_HOURS";
    BlockDuration[BlockDuration["NINE_HOURS"] = 540] = "NINE_HOURS";
    BlockDuration[BlockDuration["TEN_HOURS"] = 600] = "TEN_HOURS";
    BlockDuration[BlockDuration["ELEVEN_HOURS"] = 660] = "ELEVEN_HOURS";
    BlockDuration[BlockDuration["TWELVE_HOURS"] = 720] = "TWELVE_HOURS";
    BlockDuration[BlockDuration["THIRTEEN_HOURS"] = 780] = "THIRTEEN_HOURS";
    BlockDuration[BlockDuration["FOURTEEN_HOURS"] = 840] = "FOURTEEN_HOURS";
    BlockDuration[BlockDuration["FIFTEEN_HOURS"] = 900] = "FIFTEEN_HOURS";
    BlockDuration[BlockDuration["SIXTEEN_HOURS"] = 960] = "SIXTEEN_HOURS";
    BlockDuration[BlockDuration["SEVENTEEN_HOURS"] = 1020] = "SEVENTEEN_HOURS";
    BlockDuration[BlockDuration["EIGHTTEEN_HOURS"] = 1080] = "EIGHTTEEN_HOURS";
    BlockDuration[BlockDuration["NINETEEN_HOURS"] = 1140] = "NINETEEN_HOURS";
    BlockDuration[BlockDuration["TWENTY_HOURS"] = 1200] = "TWENTY_HOURS";
})(BlockDuration = exports.BlockDuration || (exports.BlockDuration = {}));
var InstanceInterruptionBehavior;
(function (InstanceInterruptionBehavior) {
    InstanceInterruptionBehavior["HIBERNATE"] = "hibernate";
    InstanceInterruptionBehavior["STOP"] = "stop";
    InstanceInterruptionBehavior["TERMINATE"] = "terminate";
})(InstanceInterruptionBehavior = exports.InstanceInterruptionBehavior || (exports.InstanceInterruptionBehavior = {}));
class GitlabContainerRunner extends core_1.Construct {
    constructor(scope, id, props) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        super(scope, id);
        const spotFleetId = id;
        const token = props.gitlabtoken;
        const tag1 = (_a = props.tag1) !== null && _a !== void 0 ? _a : 'gitlab';
        const tag2 = (_b = props.tag2) !== null && _b !== void 0 ? _b : 'awscdk';
        const tag3 = (_c = props.tag3) !== null && _c !== void 0 ? _c : 'runner';
        const gitlaburl = (_d = props.gitlaburl) !== null && _d !== void 0 ? _d : 'https://gitlab.com/';
        const ec2type = (_e = props.ec2type) !== null && _e !== void 0 ? _e : 't3.micro';
        const shell = aws_ec2_1.UserData.forLinux();
        shell.addCommands('yum update -y ', 'sleep 15 && yum install docker git -y && systemctl start docker && usermod -aG docker ec2-user && chmod 777 /var/run/docker.sock', 'systemctl restart docker && systemctl enable docker', 'docker run -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner-register gitlab/gitlab-runner:alpine register --non-interactive --url ' +
            gitlaburl +
            ' --registration-token ' +
            token +
            ' --docker-pull-policy if-not-present --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" --executor docker --docker-image "alpine:latest" --description "Docker Runner" --tag-list "' +
            tag1 +
            ',' +
            tag2 +
            ',' +
            tag3 +
            '" --docker-privileged', 'sleep 2 && docker run --restart always -d -v /home/ec2-user/.gitlab-runner:/etc/gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock --name gitlab-runner gitlab/gitlab-runner:alpine', 'usermod -aG docker ssm-user');
        this.runnerRole = (_f = props.ec2iamrole) !== null && _f !== void 0 ? _f : new aws_iam_1.Role(this, 'runner-role', {
            assumedBy: new aws_iam_1.ServicePrincipal('ec2.amazonaws.com'),
            description: 'For Gitlab EC2 Runner Role',
        });
        this.validUntil = props.validUntil;
        const instanceProfile = new aws_iam_1.CfnInstanceProfile(this, 'InstanceProfile', {
            roles: [this.runnerRole.roleName],
        });
        this.vpc = (_g = props.selfvpc) !== null && _g !== void 0 ? _g : new aws_ec2_1.Vpc(this, 'VPC', {
            cidr: '10.0.0.0/16',
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 26,
                    name: 'RunnerVPC',
                    subnetType: aws_ec2_1.SubnetType.PUBLIC,
                },
            ],
            natGateways: 0,
        });
        this.defaultRunnerSG = new aws_ec2_1.SecurityGroup(this, 'SpotFleetSg', {
            vpc: this.vpc,
        });
        this.defaultRunnerSG.connections.allowFromAnyIpv4(aws_ec2_1.Port.tcp(22));
        const spotOrOnDemand = (_h = props.spotFleet) !== null && _h !== void 0 ? _h : false;
        if (spotOrOnDemand) {
            //throw new Error('yes new spotfleet');
            const imageId = aws_ec2_1.MachineImage.latestAmazonLinux({
                generation: aws_ec2_1.AmazonLinuxGeneration.AMAZON_LINUX_2,
            }).getImage(this).imageId;
            const lt = new aws_ec2_1.CfnLaunchTemplate(this, 'LaunchTemplate', {
                launchTemplateData: {
                    imageId,
                    instanceType: ec2type,
                    blockDeviceMappings: [
                        {
                            deviceName: '/dev/xvda',
                            ebs: {
                                volumeSize: (_j = props.ebsSize) !== null && _j !== void 0 ? _j : 60,
                            },
                        },
                    ],
                    userData: core_1.Fn.base64(shell.render()),
                    keyName: props.keyName,
                    tagSpecifications: [
                        {
                            resourceType: 'instance',
                            tags: [
                                {
                                    key: 'Name',
                                    value: `${core_1.Stack.of(this).stackName}/spotFleetGitlabRunner/${spotFleetId}`,
                                },
                            ],
                        },
                    ],
                    instanceMarketOptions: {
                        marketType: 'spot',
                        spotOptions: {
                            blockDurationMinutes: (_k = props.blockDuration) !== null && _k !== void 0 ? _k : BlockDuration.ONE_HOUR,
                            instanceInterruptionBehavior: (_l = props.instanceInterruptionBehavior) !== null && _l !== void 0 ? _l : InstanceInterruptionBehavior.TERMINATE,
                        },
                    },
                    securityGroupIds: this.defaultRunnerSG.connections.securityGroups.map((m) => m.securityGroupId),
                    iamInstanceProfile: {
                        arn: instanceProfile.attrArn,
                    },
                },
            });
            const spotFleetRole = new aws_iam_1.Role(this, 'FleetRole', {
                assumedBy: new aws_iam_1.ServicePrincipal('spotfleet.amazonaws.com'),
                managedPolicies: [
                    aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2SpotFleetTaggingRole'),
                ],
            });
            const vpcSubnetSelection = (_m = props.vpcSubnet) !== null && _m !== void 0 ? _m : {
                subnetType: aws_ec2_1.SubnetType.PUBLIC,
            };
            const subnetConfig = this.vpc
                .selectSubnets(vpcSubnetSelection)
                .subnets.map((s) => ({
                subnetId: s.subnetId,
            }));
            const cfnSpotFleet = new aws_ec2_1.CfnSpotFleet(this, id, {
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
                    validUntil: core_1.Lazy.stringValue({ produce: () => this.validUntil }),
                    terminateInstancesWithExpiration: true,
                },
            });
            const onEvent = new lambda.Function(this, 'OnEvent', {
                code: lambda.Code.fromAsset(path.join(__dirname, './')),
                handler: 'index.on_event',
                runtime: lambda.Runtime.PYTHON_3_8,
                timeout: core_1.Duration.seconds(60),
            });
            const isComplete = new lambda.Function(this, 'IsComplete', {
                code: lambda.Code.fromAsset(path.join(__dirname, './')),
                handler: 'index.is_complete',
                runtime: lambda.Runtime.PYTHON_3_8,
                timeout: core_1.Duration.seconds(60),
                role: onEvent.role,
            });
            const myProvider = new cr.Provider(this, 'MyProvider', {
                onEventHandler: onEvent,
                isCompleteHandler: isComplete,
                logRetention: logs.RetentionDays.ONE_DAY,
            });
            onEvent.addToRolePolicy(new aws_iam_1.PolicyStatement({
                actions: ['ec2:DescribeSpotFleetInstances'],
                resources: ['*'],
            }));
            const fleetInstances = new core_1.CustomResource(this, 'GetInstanceId', {
                serviceToken: myProvider.serviceToken,
                properties: {
                    SpotFleetRequestId: cfnSpotFleet.ref,
                },
            });
            fleetInstances.node.addDependency(cfnSpotFleet);
            this.spotFleetInstanceId = core_1.Token.asString(fleetInstances.getAtt('InstanceId'));
            this.spotFleetRequestId = core_1.Token.asString(fleetInstances.getAtt('SpotInstanceRequestId'));
            new core_1.CfnOutput(this, 'InstanceId', { value: this.spotFleetInstanceId });
            new core_1.CfnOutput(this, 'SpotFleetId', { value: cfnSpotFleet.ref });
        }
        else {
            this.runnerEc2 = new aws_ec2_1.Instance(this, 'GitlabRunner', {
                instanceType: new aws_ec2_1.InstanceType(ec2type),
                instanceName: 'Gitlab-Runner',
                vpc: this.vpc,
                vpcSubnets: (_o = props.vpcSubnet) !== null && _o !== void 0 ? _o : {
                    subnetType: aws_ec2_1.SubnetType.PUBLIC,
                },
                machineImage: aws_ec2_1.MachineImage.latestAmazonLinux({
                    generation: aws_ec2_1.AmazonLinuxGeneration.AMAZON_LINUX_2,
                }),
                role: this.runnerRole,
                userData: shell,
                securityGroup: this.defaultRunnerSG,
                blockDevices: [
                    {
                        deviceName: '/dev/xvda',
                        volume: aws_ec2_1.BlockDeviceVolume.ebs((_p = props.ebsSize) !== null && _p !== void 0 ? _p : 60),
                    },
                ],
            });
            new core_1.CfnOutput(this, 'Runner-Instance-ID', {
                value: this.runnerEc2.instanceId,
            });
        }
        this.runnerRole.addManagedPolicy(aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
        new core_1.CfnOutput(this, 'Runner-Role-Arn', {
            value: this.runnerRole.roleArn,
        });
    }
    /**
     * @default - !!! only support spotfleet runner !!! .
     */
    expireAfter(duration) {
        const date = new Date();
        date.setSeconds(date.getSeconds() + duration.toSeconds());
        this.validUntil = date.toISOString();
    }
}
exports.GitlabContainerRunner = GitlabContainerRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3Q0FTdUI7QUFDdkIsOENBTzBCO0FBQzFCLDhDQWlCMEI7QUFDMUIsOENBQThDO0FBQzlDLDBDQUEwQztBQUMxQyw2QkFBNkI7QUFDN0IsZ0RBQWdEO0FBc0xoRCxJQUFZLGFBcUJYO0FBckJELFdBQVksYUFBYTtJQUN2QiwwREFBYSxDQUFBO0lBQ2IsNkRBQWUsQ0FBQTtJQUNmLGlFQUFpQixDQUFBO0lBQ2pCLCtEQUFnQixDQUFBO0lBQ2hCLCtEQUFnQixDQUFBO0lBQ2hCLDZEQUFlLENBQUE7SUFDZixpRUFBaUIsQ0FBQTtJQUNqQixpRUFBaUIsQ0FBQTtJQUNqQiwrREFBZ0IsQ0FBQTtJQUNoQiw2REFBZSxDQUFBO0lBQ2YsbUVBQWtCLENBQUE7SUFDbEIsbUVBQWtCLENBQUE7SUFDbEIsdUVBQW9CLENBQUE7SUFDcEIsdUVBQW9CLENBQUE7SUFDcEIscUVBQW1CLENBQUE7SUFDbkIscUVBQW1CLENBQUE7SUFDbkIsMEVBQXNCLENBQUE7SUFDdEIsMEVBQXNCLENBQUE7SUFDdEIsd0VBQXFCLENBQUE7SUFDckIsb0VBQW1CLENBQUE7QUFDckIsQ0FBQyxFQXJCVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQXFCeEI7QUFFRCxJQUFZLDRCQUlYO0FBSkQsV0FBWSw0QkFBNEI7SUFDdEMsdURBQXVCLENBQUE7SUFDdkIsNkNBQWEsQ0FBQTtJQUNiLHVEQUF1QixDQUFBO0FBQ3pCLENBQUMsRUFKVyw0QkFBNEIsR0FBNUIsb0NBQTRCLEtBQTVCLG9DQUE0QixRQUl2QztBQUVELE1BQWEscUJBQXNCLFNBQVEsZ0JBQVM7SUE4QmxELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBaUM7O1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakIsTUFBTSxXQUFXLEdBQUcsRUFBRSxD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SUFBSSxFQUFFLG9CQUFvQixFQUFFO2dCQUN4QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVO2FBQ2pDLENBQUMsQ0FBQztTQUNKO1FBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FDOUIsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQyw4QkFBOEIsQ0FBQyxDQUN2RSxDQUFDO1FBRUYsSUFBSSxnQkFBUyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUNyQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPO1NBQy9CLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLFdBQVcsQ0FBQyxRQUFrQjtRQUNuQyxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7Q0FDRjtBQXZRRCxzREF1UUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb25zdHJ1Y3QsXG4gIENmbk91dHB1dCxcbiAgRm4sXG4gIFN0YWNrLFxuICBEdXJhdGlvbixcbiAgTGF6eSxcbiAgQ3VzdG9tUmVzb3VyY2UsXG4gIFRva2VuLFxufSBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCB7XG4gIElSb2xlLFxuICBSb2xlLFxuICBTZXJ2aWNlUHJpbmNpcGFsLFxuICBNYW5hZ2VkUG9saWN5LFxuICBDZm5JbnN0YW5jZVByb2ZpbGUsXG4gIFBvbGljeVN0YXRlbWVudCxcbn0gZnJvbSAnQGF3cy1jZGsvYXdzLWlhbSc7XG5pbXBvcnQge1xuICBJbnN0YW5jZSxcbiAgSW5zdGFuY2VUeXBlLFxuICBNYWNoaW5lSW1hZ2UsXG4gIFVzZXJEYXRhLFxuICBCbG9ja0RldmljZVZvbHVtZSxcbiAgQW1hem9uTGludXhHZW5lcmF0aW9uLFxuICBTdWJuZXRUeXBlLFxuICBWcGMsXG4gIElWcGMsXG4gIElJbnN0YW5jZSxcbiAgU2VjdXJpdHlHcm91cCxcbiAgUG9ydCxcbiAgQ2ZuTGF1bmNoVGVtcGxhdGUsXG4gIENmblNwb3RGbGVldCxcbiAgSVNlY3VyaXR5R3JvdXAsXG4gIFN1Ym5ldFNlbGVjdGlvbixcbn0gZnJvbSAnQGF3cy1jZGsvYXdzLWVjMic7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnQGF3cy1jZGsvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ0Bhd3MtY2RrL2F3cy1sb2dzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBjciBmcm9tICdAYXdzLWNkay9jdXN0b20tcmVzb3VyY2VzJztcblxuZXhwb3J0IGludGVyZmFjZSBHaXRsYWJDb250YWluZXJSdW5uZXJQcm9wcyB7XG4gIC8qKlxuICAgKiBHaXRsYWIgdG9rZW4gZm9yIHRoZSBSZWdpc3RlciBSdW5uZXIgLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBuZXcgR2l0bGFiQ29udGFpbmVyUnVubmVyKHN0YWNrLCAncnVubmVyJywgeyBnaXRsYWJ0b2tlbjogJ0dJVExBQl9UT0tFTicgfSk7XG4gICAqXG4gICAqIEBkZWZhdWx0IC0gWW91IG11c3QgdG8gZ2l2ZSB0aGUgdG9rZW4gISEhXG4gICAqXG4gICAqL1xuICByZWFkb25seSBnaXRsYWJ0b2tlbjogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBSdW5uZXIgZGVmYXVsdCBFQzIgaW5zdGFuY2UgdHlwZS5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogbmV3IEdpdGxhYkNvbnRhaW5lclJ1bm5lcihzdGFjaywgJ3J1bm5lcicsIHsgZ2l0bGFidG9rZW46ICdHSVRMQUJfVE9LRU4nLCBlYzJ0eXBlOiAndDMuc21hbGwnIH0pO1xuICAgKlxuICAgKiBAZGVmYXVsdCAtIHQzLm1pY3JvXG4gICAqXG4gICAqL1xuICByZWFkb25seSBlYzJ0eXBlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBWUEMgZm9yIHRoZSBHaXRsYWIgUnVubmVyIC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgbmV3dnBjID0gbmV3IFZwYyhzdGFjaywgJ05FV1ZQQycsIHtcbiAgICogICBjaWRyOiAnMTAuMS4wLjAvMTYnLFxuICAgKiAgIG1heEF6czogMixcbiAgICogICBzdWJuZXRDb25maWd1cmF0aW9uOiBbe1xuICAgKiAgICAgY2lkck1hc2s6IDI2LFxuICAgKiAgICAgbmFtZTogJ1J1bm5lclZQQycsXG4gICAqICAgICBzdWJuZXRUeXBlOiBTdWJuZXRUeXBlLlBVQkxJQyxcbiAgICogICB9XSxcbiAgICogICBuYXRHYXRld2F5czogMCxcbiAgICogfSk7XG4gICAqXG4gICAqIG5ldyBHaXRsYWJDb250YWluZXJSdW5uZXIoc3RhY2ssICdydW5uZXInLCB7IGdpdGxhYnRva2VuOiAnR0lUTEFCX1RPS0VOJywgc2VsZnZwYzogbmV3dnBjIH0pO1xuICAgKlxuICAgKiBAZGVmYXVsdCAtIG5ldyBWUEMgd2lsbCBiZSBjcmVhdGVkICwgMSBWcGMgLCAyIFB1YmxpYyBTdWJuZXQgLlxuICAgKlxuICAgKi9cbiAgcmVhZG9ubHkgc2VsZnZwYz86IElWcGM7XG5cbiAgLyoqXG4gICAqIElBTSByb2xlIGZvciB0aGUgR2l0bGFiIFJ1bm5lciBJbnN0YW5jZSAuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGNvbnN0IHJvbGUgPSBuZXcgUm9sZShzdGFjaywgJ3J1bm5lci1yb2xlJywge1xuICAgKiAgIGFzc3VtZWRCeTogbmV3IFNlcnZpY2VQcmluY2lwYWwoJ2VjMi5hbWF6b25hd3MuY29tJyksXG4gICAqICAgZGVzY3JpcHRpb246ICdGb3IgR2l0bGFiIEVDMiBSdW5uZXIgVGVzdCBSb2xlJyxcbiAgICogICByb2xlTmFtZTogJ015c2VsZi1SdW5uZXItUm9sZScsXG4gICAqIH0pO1xuICAgKlxuICAgKiBuZXcgR2l0bGFiQ29udGFpbmVyUnVubmVyKHN0YWNrLCAncnVubmVyJywgeyBnaXRsYWJ0b2tlbjogJ0dJVExBQl9UT0tFTicsIGVjMmlhbXJvbGU6IHJvbGUgfSk7XG4gICAqXG4gICAqIEBkZWZhdWx0IC0gbmV3IFJvbGUgZm9yIEdpdGxhYiBSdW5uZXIgSW5zdGFuY2UgLCBhdHRhY2ggQW1hem9uU1NNTWFuYWdlZEluc3RhbmNlQ29yZSBQb2xpY3kgLlxuICAgKlxuICAgKi9cbiAgcmVhZG9ubHkgZWMyaWFtcm9sZT86IElSb2xlO1xuXG4gIC8qKlxuICAgKiBHaXRsYWIgUnVubmVyIHJlZ2lzdGVyIHRhZzEgIC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogbmV3IEdpdGxhYkNvbnRhaW5lclJ1bm5lcihzdGFjaywgJ3J1bm5lcicsIHsgZ2l0bGFidG9rZW46ICdHSVRMQUJfVE9LRU4nLCB0YWcxOiAnYWEnIH0pO1xuICAgKlxuICAgKiBAZGVmYXVsdCAtIHRhZzE6IGdpdGxhYiAuXG4gICAqXG4gICAqL1xuICByZWFkb25seSB0YWcxPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBHaXRsYWIgUnVubmVyIHJlZ2lzdGVyIHRhZzIgIC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogbmV3IEdpdGxhYkNvbnRhaW5lclJ1bm5lcihzdGFjaywgJ3J1bm5lcicsIHsgZ2l0bGFidG9rZW46ICdHSVRMQUJfVE9LRU4nLCB0YWcyOiAnYmInIH0pO1xuICAgKlxuICAgKiBAZGVmYXVsdCAtIHRhZzI6IGF3c2NkayAuXG4gICAqXG4gICAqL1xuICByZWFkb25seSB0YWcyPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBHaXRsYWIgUnVubmVyIHJlZ2lzdGVyIHRhZzMgIC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogbmV3IEdpdGxhYkNvbnRhaW5lclJ1bm5lcihzdGFjaywgJ3J1bm5lcicsIHsgZ2l0bGFidG9rZW46ICdHSVRMQUJfVE9LRU4nLCB0YWczOiAnY2MnIH0pO1xuICAgKlxuICAgKiBAZGVmYXVsdCAtIHRhZzM6IHJ1bm5lciAuXG4gICAqXG4gICAqL1xuICByZWFkb25seSB0YWczPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBHaXRsYWIgUnVubmVyIHJlZ2lzdGVyIHVybCAuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGNvbnN0IHJ1bm5lciA9IG5ldyBHaXRsYWJDb250YWluZXJSdW5uZXIoc3RhY2ssICdydW5uZXInLCB7IGdpdGxhYnRva2VuOiAnR0lUTEFCX1RPS0VOJyxnaXRsYWJ1cmw6ICdodHRwczovL2dpdGxhYi5jb20vJ30pO1xuICAgKlxuICAgKiBAZGVmYXVsdCAtIGdpdGxhYnVybD0naHR0cHM6Ly9naXRsYWIuY29tLydcbiAgICpcbiAgICovXG4gIHJlYWRvbmx5IGdpdGxhYnVybD86IHN0cmluZztcblxuICAvKipcbiAgICogR2l0bGFiIFJ1bm5lciBpbnN0YW5jZSBFQlMgc2l6ZSAuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGNvbnN0IHJ1bm5lciA9IG5ldyBHaXRsYWJDb250YWluZXJSdW5uZXIoc3RhY2ssICdydW5uZXInLCB7IGdpdGxhYnRva2VuOiAnR0lUTEFCX1RPS0VOJyxlYnNTaXplOiAxMDB9KTtcbiAgICpcbiAgICogQGRlZmF1bHQgLSBlYnNTaXplPTYwXG4gICAqXG4gICAqL1xuICByZWFkb25seSBlYnNTaXplPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBHaXRsYWIgUnVubmVyIGluc3RhbmNlIFVzZSBTcG90IEZsZWV0IG9yIG5vdCA/IS5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgcnVubmVyID0gbmV3IEdpdGxhYkNvbnRhaW5lclJ1bm5lcihzdGFjaywgJ3J1bm5lcicsIHsgZ2l0bGFidG9rZW46ICdHSVRMQUJfVE9LRU4nLHNwb3RGbGVldDogdHJ1ZX0pO1xuICAgKlxuICAgKiBAZGVmYXVsdCAtIHNwb3RGbGVldD1mYWxzZVxuICAgKlxuICAgKi9cbiAgcmVhZG9ubHkgc3BvdEZsZWV0PzogYm9vbGVhbjtcblxuICAvKipcbiAgICogU1NIIGtleSBuYW1lXG4gICAqXG4gICAqIEBkZWZhdWx0IC0gbm8gc3NoIGtleSB3aWxsIGJlIGFzc2lnbmVkICwgISEhIG9ubHkgc3VwcG9ydCBzcG90ZmxlZXQgcnVubmVyICEhISAuXG4gICAqL1xuICByZWFkb25seSBrZXlOYW1lPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBSZXNlcnZjZSB0aGUgU3BvdCBSdW5uZXIgaW5zdGFuY2UgYXMgc3BvdCBibG9jayB3aXRoIGRlZmluZWQgZHVyYXRpb25cbiAgICpcbiAgICogQGRlZmF1bHQgLSBCbG9ja0R1cmF0aW9uLk9ORV9IT1VSICwgISEhIG9ubHkgc3VwcG9ydCBzcG90ZmxlZXQgcnVubmVyICEhISAuXG4gICAqL1xuICByZWFkb25seSBibG9ja0R1cmF0aW9uPzogQmxvY2tEdXJhdGlvbjtcblxuICAvKipcbiAgICogVGhlIGJlaGF2aW9yIHdoZW4gYSBTcG90IFJ1bm5lciBJbnN0YW5jZSBpcyBpbnRlcnJ1cHRlZFxuICAgKlxuICAgKiBAZGVmYXVsdCAtIEluc3RhbmNlSW50ZXJydXB0aW9uQmVoYXZpb3IuVEVSTUlOQVRFICwgISEhIG9ubHkgc3VwcG9ydCBzcG90ZmxlZXQgcnVubmVyICEhISAuXG4gICAqL1xuICByZWFkb25seSBpbnN0YW5jZUludGVycnVwdGlvbkJlaGF2aW9yPzogSW5zdGFuY2VJbnRlcnJ1cHRpb25CZWhhdmlvcjtcblxuICAvKipcbiAgICogdGhlIHRpbWUgd2hlbiB0aGUgc3BvdCBmbGVldCBhbGxvY2F0aW9uIGV4cGlyZXNcbiAgICpcbiAgICogQGRlZmF1bHQgLSBubyBleHBpcmF0aW9uICwgISEhIG9ubHkgc3VwcG9ydCBzcG90ZmxlZXQgcnVubmVyICEhISAuXG4gICAqL1xuICByZWFkb25seSB2YWxpZFVudGlsPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBWUEMgc3VibmV0IGZvciB0aGUgc3BvdCBmbGVldFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBjb25zdCB2cGMgPSBuZXcgVnBjKHN0YWNrLCAnbmF0Jywge1xuICAgKiBuYXRHYXRld2F5czogMSxcbiAgICogbWF4QXpzOiAyLFxuICAgKiB9KTtcbiAgICogY29uc3QgcnVubmVyID0gbmV3IEdpdGxhYkNvbnRhaW5lclJ1bm5lcihzdGFjaywgJ3Rlc3RpbmcnLCB7XG4gICAqICAgZ2l0bGFidG9rZW46ICdHSVRMQUJfVE9LRU4nLFxuICAgKiAgIGVjMnR5cGU6ICd0My5sYXJnZScsXG4gICAqICAgZWMyaWFtcm9sZTogcm9sZSxcbiAgICogICBlYnNTaXplOiAxMDAsXG4gICAqICAgc2VsZnZwYzogdnBjLFxuICAgKiAgIHZwY1N1Ym5ldDoge1xuICAgKiAgICAgc3VibmV0VHlwZTogU3VibmV0VHlwZS5QVUJMSUMsXG4gICAqICAgfSxcbiAgICogfSk7XG4gICAqXG4gICAqIEBkZWZhdWx0IC0gcHVibGljIHN1Ym5ldFxuICAgKi9cbiAgcmVhZG9ubHkgdnBjU3VibmV0PzogU3VibmV0U2VsZWN0aW9uO1xufVxuXG5leHBvcnQgZW51bSBCbG9ja0R1cmF0aW9uIHtcbiAgT05FX0hPVVIgPSA2MCxcbiAgVFdPX0hPVVJTID0gMTIwLFxuICBUSFJFRV9IT1VSUyA9IDE4MCxcbiAgRk9VUl9IT1VSUyA9IDI0MCxcbiAgRklWRV9IT1VSUyA9IDMwMCxcbiAgU0lYX0hPVVJTID0gMzYwLFxuICBTRVZFTl9IT1VSUyA9IDQyMCxcbiAgRUlHSFRfSE9VUlMgPSA0ODAsXG4gIE5JTkVfSE9VUlMgPSA1NDAsXG4gIFRFTl9IT1VSUyA9IDYwMCxcbiAgRUxFVkVOX0hPVVJTID0gNjYwLFxuICBUV0VMVkVfSE9VUlMgPSA3MjAsXG4gIFRISVJURUVOX0hPVVJTID0gNzgwLFxuICBGT1VSVEVFTl9IT1VSUyA9IDg0MCxcbiAgRklGVEVFTl9IT1VSUyA9IDkwMCxcbiAgU0lYVEVFTl9IT1VSUyA9IDk2MCxcbiAgU0VWRU5URUVOX0hPVVJTID0gMTAyMCxcbiAgRUlHSFRURUVOX0hPVVJTID0gMTA4MCxcbiAgTklORVRFRU5fSE9VUlMgPSAxMTQwLFxuICBUV0VOVFlfSE9VUlMgPSAxMjAwLFxufVxuXG5leHBvcnQgZW51bSBJbnN0YW5jZUludGVycnVwdGlvbkJlaGF2aW9yIHtcbiAgSElCRVJOQVRFID0gJ2hpYmVybmF0ZScsXG4gIFNUT1AgPSAnc3RvcCcsXG4gIFRFUk1JTkFURSA9ICd0ZXJtaW5hdGUnLFxufVxuXG5leHBvcnQgY2xhc3MgR2l0bGFiQ29udGFpbmVyUnVubmVyIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgLyoqXG4gICAqIFRoZSBJQU0gcm9sZSBhc3N1bWVkIGJ5IHRoZSBSdW5uZXIgaW5zdGFuY2UgLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHJ1bm5lclJvbGU6IElSb2xlO1xuXG4gIC8qKlxuICAgKiBUaGlzIHJlcHJlc2VudHMgYSBSdW5uZXIgRUMyIGluc3RhbmNlICwgISEhIG9ubHkgc3VwcG9ydCBPbi1kZW1hbmQgcnVubmVyIGluc3RhbmNlICEhISAuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcnVubmVyRWMyITogSUluc3RhbmNlO1xuXG4gIHB1YmxpYyByZWFkb25seSB2cGMhOiBJVnBjO1xuXG4gIC8qKlxuICAgKiBUaGUgdGltZSB3aGVuIHRoZSB0aGUgZmxlZXQgYWxsb2NhdGlvbiB3aWxsIGV4cGlyZSAsICEhISBvbmx5IHN1cHBvcnQgc3BvdGZsZWV0IHJ1bm5lciAhISEgLlxuICAgKi9cbiAgcHJpdmF0ZSB2YWxpZFVudGlsPzogc3RyaW5nO1xuXG4gIHB1YmxpYyByZWFkb25seSBkZWZhdWx0UnVubmVyU0chOiBJU2VjdXJpdHlHcm91cDtcblxuICAvKipcbiAgICogU3BvdEZsZWV0UmVxdWVzdElkIGZvciB0aGlzIHNwb3QgZmxlZXQgLCAhISEgb25seSBzdXBwb3J0IHNwb3RmbGVldCBydW5uZXIgISEhIC5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBzcG90RmxlZXRSZXF1ZXN0SWQhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIHRoZSBmaXJzdCBpbnN0YW5jZSBpZCBpbiB0aGlzIGZsZWV0ICwgISEhIG9ubHkgc3VwcG9ydCBzcG90ZmxlZXQgcnVubmVyICEhISAuXG4gICAqL1xuICByZWFkb25seSBzcG90RmxlZXRJbnN0YW5jZUlkITogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBHaXRsYWJDb250YWluZXJSdW5uZXJQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG4gICAgY29uc3Qgc3BvdEZsZWV0SWQgPSBpZDtcbiAgICBjb25zdCB0b2tlbiA9IHByb3BzLmdpdGxhYnRva2VuO1xuICAgIGNvbnN0IHRhZzEgPSBwcm9wcy50YWcxID8/ICdnaXRsYWInO1xuICAgIGNvbnN0IHRhZzIgPSBwcm9wcy50YWcyID8/ICdhd3NjZGsnO1xuICAgIGNvbnN0IHRhZzMgPSBwcm9wcy50YWczID8/ICdydW5uZXInO1xuICAgIGNvbnN0IGdpdGxhYnVybCA9IHByb3BzLmdpdGxhYnVybCA/PyAnaHR0cHM6Ly9naXRsYWIuY29tLyc7XG4gICAgY29uc3QgZWMydHlwZSA9IHByb3BzLmVjMnR5cGUgPz8gJ3QzLm1pY3JvJztcbiAgICBjb25zdCBzaGVsbCA9IFVzZXJEYXRhLmZvckxpbnV4KCk7XG4gICAgc2hlbGwuYWRkQ29tbWFuZHMoXG4gICAgICAneXVtIHVwZGF0ZSAteSAnLFxuICAgICAgJ3NsZWVwIDE1ICYmIHl1bSBpbnN0YWxsIGRvY2tlciBnaXQgLXkgJiYgc3lzdGVtY3RsIHN0YXJ0IGRvY2tlciAmJiB1c2VybW9kIC1hRyBkb2NrZXIgZWMyLXVzZXIgJiYgY2htb2QgNzc3IC92YXIvcnVuL2RvY2tlci5zb2NrJyxcbiAgICAgICdzeXN0ZW1jdGwgcmVzdGFydCBkb2NrZXIgJiYgc3lzdGVtY3RsIGVuYWJsZSBkb2NrZXInLFxuICAgICAgJ2RvY2tlciBydW4gLWQgLXYgL2hvbWUvZWMyLXVzZXIvLmdpdGxhYi1ydW5uZXI6L2V0Yy9naXRsYWItcnVubmVyIC12IC92YXIvcnVuL2RvY2tlci5zb2NrOi92YXIvcnVuL2RvY2tlci5zb2NrIC0tbmFtZSBnaXRsYWItcnVubmVyLXJlZ2lzdGVyIGdpdGxhYi9naXRsYWItcnVubmVyOmFscGluZSByZWdpc3RlciAtLW5vbi1pbnRlcmFjdGl2ZSAtLXVybCAnICtcbiAgICAgICAgZ2l0bGFidXJsICtcbiAgICAgICAgJyAtLXJlZ2lzdHJhdGlvbi10b2tlbiAnICtcbiAgICAgICAgdG9rZW4gK1xuICAgICAgICAnIC0tZG9ja2VyLXB1bGwtcG9saWN5IGlmLW5vdC1wcmVzZW50IC0tZG9ja2VyLXZvbHVtZXMgXCIvdmFyL3J1bi9kb2NrZXIuc29jazovdmFyL3J1bi9kb2NrZXIuc29ja1wiIC0tZXhlY3V0b3IgZG9ja2VyIC0tZG9ja2VyLWltYWdlIFwiYWxwaW5lOmxhdGVzdFwiIC0tZGVzY3JpcHRpb24gXCJEb2NrZXIgUnVubmVyXCIgLS10YWctbGlzdCBcIicgK1xuICAgICAgICB0YWcxICtcbiAgICAgICAgJywnICtcbiAgICAgICAgdGFnMiArXG4gICAgICAgICcsJyArXG4gICAgICAgIHRhZzMgK1xuICAgICAgICAnXCIgLS1kb2NrZXItcHJpdmlsZWdlZCcsXG5cbiAgICAgICdzbGVlcCAyICYmIGRvY2tlciBydW4gLS1yZXN0YXJ0IGFsd2F5cyAtZCAtdiAvaG9tZS9lYzItdXNlci8uZ2l0bGFiLXJ1bm5lcjovZXRjL2dpdGxhYi1ydW5uZXIgLXYgL3Zhci9ydW4vZG9ja2VyLnNvY2s6L3Zhci9ydW4vZG9ja2VyLnNvY2sgLS1uYW1lIGdpdGxhYi1ydW5uZXIgZ2l0bGFiL2dpdGxhYi1ydW5uZXI6YWxwaW5lJyxcbiAgICAgICd1c2VybW9kIC1hRyBkb2NrZXIgc3NtLXVzZXInLFxuICAgICk7XG5cbiAgICB0aGlzLnJ1bm5lclJvbGUgPVxuICAgICAgcHJvcHMuZWMyaWFtcm9sZSA/P1xuICAgICAgbmV3IFJvbGUodGhpcywgJ3J1bm5lci1yb2xlJywge1xuICAgICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdlYzIuYW1hem9uYXdzLmNvbScpLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0ZvciBHaXRsYWIgRUMyIFJ1bm5lciBSb2xlJyxcbiAgICAgIH0pO1xuICAgIHRoaXMudmFsaWRVbnRpbCA9IHByb3BzLnZhbGlkVW50aWw7XG4gICAgY29uc3QgaW5zdGFuY2VQcm9maWxlID0gbmV3IENmbkluc3RhbmNlUHJvZmlsZSh0aGlzLCAnSW5zdGFuY2VQcm9maWxlJywge1xuICAgICAgcm9sZXM6IFt0aGlzLnJ1bm5lclJvbGUucm9sZU5hbWVdLFxuICAgIH0pO1xuXG4gICAgdGhpcy52cGMgPVxuICAgICAgcHJvcHMuc2VsZnZwYyA/P1xuICAgICAgbmV3IFZwYyh0aGlzLCAnVlBDJywge1xuICAgICAgICBjaWRyOiAnMTAuMC4wLjAvMTYnLFxuICAgICAgICBtYXhBenM6IDIsXG4gICAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjaWRyTWFzazogMjYsXG4gICAgICAgICAgICBuYW1lOiAnUnVubmVyVlBDJyxcbiAgICAgICAgICAgIHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFVCTElDLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5hdEdhdGV3YXlzOiAwLFxuICAgICAgfSk7XG4gICAgdGhpcy5kZWZhdWx0UnVubmVyU0cgPSBuZXcgU2VjdXJpdHlHcm91cCh0aGlzLCAnU3BvdEZsZWV0U2cnLCB7XG4gICAgICB2cGM6IHRoaXMudnBjLFxuICAgIH0pO1xuICAgIHRoaXMuZGVmYXVsdFJ1bm5lclNHLmNvbm5lY3Rpb25zLmFsbG93RnJvbUFueUlwdjQoUG9ydC50Y3AoMjIpKTtcbiAgICBjb25zdCBzcG90T3JPbkRlbWFuZCA9IHByb3BzLnNwb3RGbGVldCA/PyBmYWxzZTtcbiAgICBpZiAoc3BvdE9yT25EZW1hbmQpIHtcbiAgICAgIC8vdGhyb3cgbmV3IEVycm9yKCd5ZXMgbmV3IHNwb3RmbGVldCcpO1xuXG4gICAgICBjb25zdCBpbWFnZUlkID0gTWFjaGluZUltYWdlLmxhdGVzdEFtYXpvbkxpbnV4KHtcbiAgICAgICAgZ2VuZXJhdGlvbjogQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWF8yLFxuICAgICAgfSkuZ2V0SW1hZ2UodGhpcykuaW1hZ2VJZDtcbiAgICAgIGNvbnN0IGx0ID0gbmV3IENmbkxhdW5jaFRlbXBsYXRlKHRoaXMsICdMYXVuY2hUZW1wbGF0ZScsIHtcbiAgICAgICAgbGF1bmNoVGVtcGxhdGVEYXRhOiB7XG4gICAgICAgICAgaW1hZ2VJZCxcbiAgICAgICAgICBpbnN0YW5jZVR5cGU6IGVjMnR5cGUsXG4gICAgICAgICAgYmxvY2tEZXZpY2VNYXBwaW5nczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBkZXZpY2VOYW1lOiAnL2Rldi94dmRhJyxcbiAgICAgICAgICAgICAgZWJzOiB7XG4gICAgICAgICAgICAgICAgdm9sdW1lU2l6ZTogcHJvcHMuZWJzU2l6ZSA/PyA2MCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgICB1c2VyRGF0YTogRm4uYmFzZTY0KHNoZWxsLnJlbmRlcigpKSxcbiAgICAgICAgICBrZXlOYW1lOiBwcm9wcy5rZXlOYW1lLFxuICAgICAgICAgIHRhZ1NwZWNpZmljYXRpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHJlc291cmNlVHlwZTogJ2luc3RhbmNlJyxcbiAgICAgICAgICAgICAgdGFnczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGtleTogJ05hbWUnLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6IGAke1xuICAgICAgICAgICAgICAgICAgICBTdGFjay5vZih0aGlzKS5zdGFja05hbWVcbiAgICAgICAgICAgICAgICAgIH0vc3BvdEZsZWV0R2l0bGFiUnVubmVyLyR7c3BvdEZsZWV0SWR9YCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGluc3RhbmNlTWFya2V0T3B0aW9uczoge1xuICAgICAgICAgICAgbWFya2V0VHlwZTogJ3Nwb3QnLFxuICAgICAgICAgICAgc3BvdE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgYmxvY2tEdXJhdGlvbk1pbnV0ZXM6XG4gICAgICAgICAgICAgICAgcHJvcHMuYmxvY2tEdXJhdGlvbiA/PyBCbG9ja0R1cmF0aW9uLk9ORV9IT1VSLFxuICAgICAgICAgICAgICBpbnN0YW5jZUludGVycnVwdGlvbkJlaGF2aW9yOlxuICAgICAgICAgICAgICAgIHByb3BzLmluc3RhbmNlSW50ZXJydXB0aW9uQmVoYXZpb3IgPz9cbiAgICAgICAgICAgICAgICBJbnN0YW5jZUludGVycnVwdGlvbkJlaGF2aW9yLlRFUk1JTkFURSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZWN1cml0eUdyb3VwSWRzOiB0aGlzLmRlZmF1bHRSdW5uZXJTRy5jb25uZWN0aW9ucy5zZWN1cml0eUdyb3Vwcy5tYXAoXG4gICAgICAgICAgICAobSkgPT4gbS5zZWN1cml0eUdyb3VwSWQsXG4gICAgICAgICAgKSxcbiAgICAgICAgICBpYW1JbnN0YW5jZVByb2ZpbGU6IHtcbiAgICAgICAgICAgIGFybjogaW5zdGFuY2VQcm9maWxlLmF0dHJBcm4sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBzcG90RmxlZXRSb2xlID0gbmV3IFJvbGUodGhpcywgJ0ZsZWV0Um9sZScsIHtcbiAgICAgICAgYXNzdW1lZEJ5OiBuZXcgU2VydmljZVByaW5jaXBhbCgnc3BvdGZsZWV0LmFtYXpvbmF3cy5jb20nKSxcbiAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXG4gICAgICAgICAgICAnc2VydmljZS1yb2xlL0FtYXpvbkVDMlNwb3RGbGVldFRhZ2dpbmdSb2xlJyxcbiAgICAgICAgICApLFxuICAgICAgICBdLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHZwY1N1Ym5ldFNlbGVjdGlvbiA9IHByb3BzLnZwY1N1Ym5ldCA/PyB7XG4gICAgICAgIHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFVCTElDLFxuICAgICAgfTtcbiAgICAgIGNvbnN0IHN1Ym5ldENvbmZpZyA9IHRoaXMudnBjXG4gICAgICAgIC5zZWxlY3RTdWJuZXRzKHZwY1N1Ym5ldFNlbGVjdGlvbilcbiAgICAgICAgLnN1Ym5ldHMubWFwKChzKSA9PiAoe1xuICAgICAgICAgIHN1Ym5ldElkOiBzLnN1Ym5ldElkLFxuICAgICAgICB9KSk7XG5cbiAgICAgIGNvbnN0IGNmblNwb3RGbGVldCA9IG5ldyBDZm5TcG90RmxlZXQodGhpcywgaWQsIHtcbiAgICAgICAgc3BvdEZsZWV0UmVxdWVzdENvbmZpZ0RhdGE6IHtcbiAgICAgICAgICBsYXVuY2hUZW1wbGF0ZUNvbmZpZ3M6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGF1bmNoVGVtcGxhdGVTcGVjaWZpY2F0aW9uOiB7XG4gICAgICAgICAgICAgICAgbGF1bmNoVGVtcGxhdGVJZDogbHQucmVmLFxuICAgICAgICAgICAgICAgIHZlcnNpb246IGx0LmF0dHJMYXRlc3RWZXJzaW9uTnVtYmVyLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBvdmVycmlkZXM6IHN1Ym5ldENvbmZpZyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgICBpYW1GbGVldFJvbGU6IHNwb3RGbGVldFJvbGUucm9sZUFybixcbiAgICAgICAgICB0YXJnZXRDYXBhY2l0eTogMSxcbiAgICAgICAgICB2YWxpZFVudGlsOiBMYXp5LnN0cmluZ1ZhbHVlKHsgcHJvZHVjZTogKCkgPT4gdGhpcy52YWxpZFVudGlsIH0pLFxuICAgICAgICAgIHRlcm1pbmF0ZUluc3RhbmNlc1dpdGhFeHBpcmF0aW9uOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICBjb25zdCBvbkV2ZW50ID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnT25FdmVudCcsIHtcbiAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLycpKSxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4Lm9uX2V2ZW50JyxcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOCxcbiAgICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgaXNDb21wbGV0ZSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0lzQ29tcGxldGUnLCB7XG4gICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi8nKSksXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5pc19jb21wbGV0ZScsXG4gICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzgsXG4gICAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgICByb2xlOiBvbkV2ZW50LnJvbGUsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgbXlQcm92aWRlciA9IG5ldyBjci5Qcm92aWRlcih0aGlzLCAnTXlQcm92aWRlcicsIHtcbiAgICAgICAgb25FdmVudEhhbmRsZXI6IG9uRXZlbnQsXG4gICAgICAgIGlzQ29tcGxldGVIYW5kbGVyOiBpc0NvbXBsZXRlLFxuICAgICAgICBsb2dSZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfREFZLFxuICAgICAgfSk7XG5cbiAgICAgIG9uRXZlbnQuYWRkVG9Sb2xlUG9saWN5KFxuICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICBhY3Rpb25zOiBbJ2VjMjpEZXNjcmliZVNwb3RGbGVldEluc3RhbmNlcyddLFxuICAgICAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgICAgY29uc3QgZmxlZXRJbnN0YW5jZXMgPSBuZXcgQ3VzdG9tUmVzb3VyY2UodGhpcywgJ0dldEluc3RhbmNlSWQnLCB7XG4gICAgICAgIHNlcnZpY2VUb2tlbjogbXlQcm92aWRlci5zZXJ2aWNlVG9rZW4sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBTcG90RmxlZXRSZXF1ZXN0SWQ6IGNmblNwb3RGbGVldC5yZWYsXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgZmxlZXRJbnN0YW5jZXMubm9kZS5hZGREZXBlbmRlbmN5KGNmblNwb3RGbGVldCk7XG4gICAgICB0aGlzLnNwb3RGbGVldEluc3RhbmNlSWQgPSBUb2tlbi5hc1N0cmluZyhcbiAgICAgICAgZmxlZXRJbnN0YW5jZXMuZ2V0QXR0KCdJbnN0YW5jZUlkJyksXG4gICAgICApO1xuICAgICAgdGhpcy5zcG90RmxlZXRSZXF1ZXN0SWQgPSBUb2tlbi5hc1N0cmluZyhcbiAgICAgICAgZmxlZXRJbnN0YW5jZXMuZ2V0QXR0KCdTcG90SW5zdGFuY2VSZXF1ZXN0SWQnKSxcbiAgICAgICk7XG4gICAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdJbnN0YW5jZUlkJywgeyB2YWx1ZTogdGhpcy5zcG90RmxlZXRJbnN0YW5jZUlkIH0pO1xuICAgICAgbmV3IENmbk91dHB1dCh0aGlzLCAnU3BvdEZsZWV0SWQnLCB7IHZhbHVlOiBjZm5TcG90RmxlZXQucmVmIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bm5lckVjMiA9IG5ldyBJbnN0YW5jZSh0aGlzLCAnR2l0bGFiUnVubmVyJywge1xuICAgICAgICBpbnN0YW5jZVR5cGU6IG5ldyBJbnN0YW5jZVR5cGUoZWMydHlwZSksXG4gICAgICAgIGluc3RhbmNlTmFtZTogJ0dpdGxhYi1SdW5uZXInLFxuICAgICAgICB2cGM6IHRoaXMudnBjLFxuICAgICAgICB2cGNTdWJuZXRzOiBwcm9wcy52cGNTdWJuZXQgPz8ge1xuICAgICAgICAgIHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFVCTElDLFxuICAgICAgICB9LFxuICAgICAgICBtYWNoaW5lSW1hZ2U6IE1hY2hpbmVJbWFnZS5sYXRlc3RBbWF6b25MaW51eCh7XG4gICAgICAgICAgZ2VuZXJhdGlvbjogQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWF8yLFxuICAgICAgICB9KSxcbiAgICAgICAgcm9sZTogdGhpcy5ydW5uZXJSb2xlLFxuICAgICAgICB1c2VyRGF0YTogc2hlbGwsXG4gICAgICAgIHNlY3VyaXR5R3JvdXA6IHRoaXMuZGVmYXVsdFJ1bm5lclNHLFxuICAgICAgICBibG9ja0RldmljZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBkZXZpY2VOYW1lOiAnL2Rldi94dmRhJyxcbiAgICAgICAgICAgIHZvbHVtZTogQmxvY2tEZXZpY2VWb2x1bWUuZWJzKHByb3BzLmVic1NpemUgPz8gNjApLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KTtcbiAgICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1J1bm5lci1JbnN0YW5jZS1JRCcsIHtcbiAgICAgICAgdmFsdWU6IHRoaXMucnVubmVyRWMyLmluc3RhbmNlSWQsXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5ydW5uZXJSb2xlLmFkZE1hbmFnZWRQb2xpY3koXG4gICAgICBNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQW1hem9uU1NNTWFuYWdlZEluc3RhbmNlQ29yZScpLFxuICAgICk7XG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdSdW5uZXItUm9sZS1Bcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5ydW5uZXJSb2xlLnJvbGVBcm4sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQGRlZmF1bHQgLSAhISEgb25seSBzdXBwb3J0IHNwb3RmbGVldCBydW5uZXIgISEhIC5cbiAgICovXG4gIHB1YmxpYyBleHBpcmVBZnRlcihkdXJhdGlvbjogRHVyYXRpb24pIHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgICBkYXRlLnNldFNlY29uZHMoZGF0ZS5nZXRTZWNvbmRzKCkgKyBkdXJhdGlvbi50b1NlY29uZHMoKSk7XG4gICAgdGhpcy52YWxpZFVudGlsID0gZGF0ZS50b0lTT1N0cmluZygpO1xuICB9XG59XG4iXX0=