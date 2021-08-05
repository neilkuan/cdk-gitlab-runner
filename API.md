# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### GitlabContainerRunner <a name="cdk-gitlab-runner.GitlabContainerRunner"></a>

GitlabContainerRunner Construct for create a Gitlab Runner.

#### Initializer <a name="cdk-gitlab-runner.GitlabContainerRunner.Initializer"></a>

```typescript
import { GitlabContainerRunner } from 'cdk-gitlab-runner'

new GitlabContainerRunner(scope: Construct, id: string, props: GitlabContainerRunnerProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.parameter.props"></a>

- *Type:* [`cdk-gitlab-runner.GitlabContainerRunnerProps`](#cdk-gitlab-runner.GitlabContainerRunnerProps)

---

#### Methods <a name="Methods"></a>

##### `createUserData` <a name="cdk-gitlab-runner.GitlabContainerRunner.createUserData"></a>

```typescript
public createUserData(props: GitlabContainerRunnerProps, bucketName: string)
```

###### `props`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.parameter.props"></a>

- *Type:* [`cdk-gitlab-runner.GitlabContainerRunnerProps`](#cdk-gitlab-runner.GitlabContainerRunnerProps)

---

###### `bucketName`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.parameter.bucketName"></a>

- *Type:* `string`

the bucketName to put gitlab runner token.

---

##### `expireAfter` <a name="cdk-gitlab-runner.GitlabContainerRunner.expireAfter"></a>

```typescript
public expireAfter(duration: Duration)
```

###### `duration`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.parameter.duration"></a>

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)

Block duration.

---


#### Properties <a name="Properties"></a>

##### `defaultRunnerSG`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.property.defaultRunnerSG"></a>

- *Type:* [`@aws-cdk/aws-ec2.ISecurityGroup`](#@aws-cdk/aws-ec2.ISecurityGroup)

The EC2 runner's default SecurityGroup.

---

##### `runnerEc2`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.property.runnerEc2"></a>

- *Type:* [`@aws-cdk/aws-ec2.IInstance`](#@aws-cdk/aws-ec2.IInstance)

This represents a Runner EC2 instance , !!! only support On-demand runner instance !!!

---

##### `runnerRole`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.property.runnerRole"></a>

- *Type:* [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole)

The IAM role assumed by the Runner instance .

---

##### `spotFleetInstanceId`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.property.spotFleetInstanceId"></a>

- *Type:* `string`

the first instance id in this fleet , !!! only support spotfleet runner !!!

---

##### `spotFleetRequestId`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.property.spotFleetRequestId"></a>

- *Type:* `string`

SpotFleetRequestId for this spot fleet , !!! only support spotfleet runner !!!

---

##### `vpc`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunner.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

The EC2 runner's vpc.

---


### GitlabRunnerAutoscaling <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling"></a>

GitlabRunnerAutoscaling Construct for create Autoscaling Gitlab Runner.

#### Initializer <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.Initializer"></a>

```typescript
import { GitlabRunnerAutoscaling } from 'cdk-gitlab-runner'

new GitlabRunnerAutoscaling(scope: Construct, id: string, props: GitlabRunnerAutoscalingProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.parameter.props"></a>

- *Type:* [`cdk-gitlab-runner.GitlabRunnerAutoscalingProps`](#cdk-gitlab-runner.GitlabRunnerAutoscalingProps)

---

#### Methods <a name="Methods"></a>

##### `createUserData` <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.createUserData"></a>

```typescript
public createUserData(props: GitlabRunnerAutoscalingProps)
```

###### `props`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.parameter.props"></a>

- *Type:* [`cdk-gitlab-runner.GitlabRunnerAutoscalingProps`](#cdk-gitlab-runner.GitlabRunnerAutoscalingProps)

---


#### Properties <a name="Properties"></a>

##### `autoscalingGroup`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.autoscalingGroup"></a>

- *Type:* [`@aws-cdk/aws-autoscaling.AutoScalingGroup`](#@aws-cdk/aws-autoscaling.AutoScalingGroup)

This represents a Runner Auto Scaling Group.

---

##### `instanceRole`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.instanceRole"></a>

- *Type:* [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole)

The IAM role assumed by the Runner instance.

---

##### `securityGroup`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.securityGroup"></a>

- *Type:* [`@aws-cdk/aws-ec2.ISecurityGroup`](#@aws-cdk/aws-ec2.ISecurityGroup)

The EC2 runner's default SecurityGroup.

---

##### `topicAlarm`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.topicAlarm"></a>

- *Type:* [`@aws-cdk/aws-sns.ITopic`](#@aws-cdk/aws-sns.ITopic)

The SNS topic to suscribe alarms for EC2 runner's metrics.

---

##### `vpc`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)

The EC2 runner's VPC.

---


## Structs <a name="Structs"></a>

### DockerVolumes <a name="cdk-gitlab-runner.DockerVolumes"></a>

Docker Volumes interface.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { DockerVolumes } from 'cdk-gitlab-runner'

const dockerVolumes: DockerVolumes = { ... }
```

##### `containerPath`<sup>Required</sup> <a name="cdk-gitlab-runner.DockerVolumes.property.containerPath"></a>

- *Type:* `string`

Job Runtime Container Path Host Path.

---

##### `hostPath`<sup>Required</sup> <a name="cdk-gitlab-runner.DockerVolumes.property.hostPath"></a>

- *Type:* `string`

EC2 Runner Host Path.

---

### GitlabContainerRunnerProps <a name="cdk-gitlab-runner.GitlabContainerRunnerProps"></a>

GitlabContainerRunner Props.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { GitlabContainerRunnerProps } from 'cdk-gitlab-runner'

const gitlabContainerRunnerProps: GitlabContainerRunnerProps = { ... }
```

##### `gitlabtoken`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.gitlabtoken"></a>

- *Type:* `string`
- *Default:* You must to give the token !!!

Gitlab token for the Register Runner .

---

##### `blockDuration`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.blockDuration"></a>

- *Type:* [`cdk-gitlab-runner.BlockDuration`](#cdk-gitlab-runner.BlockDuration)
- *Default:* BlockDuration.ONE_HOUR , !!! only support spotfleet runner !!! .

Reservce the Spot Runner instance as spot block with defined duration.

---

##### `dockerVolumes`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.dockerVolumes"></a>

- *Type:* [`cdk-gitlab-runner.DockerVolumes`](#cdk-gitlab-runner.DockerVolumes)[]
- *Default:* already mount "/var/run/docker.sock:/var/run/docker.sock"

add another Gitlab Container Runner Docker Volumes Path at job runner runtime.

more detail see https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section

---

##### `ebsSize`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.ebsSize"></a>

- *Type:* `number`
- *Default:* ebsSize=60

Gitlab Runner instance EBS size .

---

##### `ec2iamrole`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.ec2iamrole"></a>

- *Type:* [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole)
- *Default:* new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .

IAM role for the Gitlab Runner Instance .

---

##### `ec2type`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.ec2type"></a>

- *Type:* `string`
- *Default:* t3.micro

Runner default EC2 instance type.

---

##### `gitlabRunnerImage`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.gitlabRunnerImage"></a>

- *Type:* `string`
- *Default:* public.ecr.aws/gitlab/gitlab-runner:alpine

Image URL of Gitlab Runner.

---

##### `gitlaburl`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.gitlaburl"></a>

- *Type:* `string`
- *Default:* gitlaburl='https://gitlab.com/' , please use https://yourgitlab.com/ do not use https://yourgitlab.com

Gitlab Runner register url .

---

##### `instanceInterruptionBehavior`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.instanceInterruptionBehavior"></a>

- *Type:* [`cdk-gitlab-runner.InstanceInterruptionBehavior`](#cdk-gitlab-runner.InstanceInterruptionBehavior)
- *Default:* InstanceInterruptionBehavior.TERMINATE , !!! only support spotfleet runner !!! .

The behavior when a Spot Runner Instance is interrupted.

---

##### `keyName`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.keyName"></a>

- *Type:* `string`
- *Default:* no ssh key will be assigned , !!! only support spotfleet runner !!! .

SSH key name.

---

##### `selfvpc`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.selfvpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)
- *Default:* new VPC will be created , 1 Vpc , 2 Public Subnet .

VPC for the Gitlab Runner .

---

##### `spotFleet`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.spotFleet"></a>

- *Type:* `boolean`
- *Default:* spotFleet=false

Gitlab Runner instance Use Spot Fleet or not ?!.

---

##### ~~`tag1`~~<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.tag1"></a>

- *Deprecated:* - use tags ['runner', 'gitlab', 'awscdk']

- *Type:* `string`
- *Default:* tag1: gitlab .

Gitlab Runner register tag1  .

---

##### ~~`tag2`~~<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.tag2"></a>

- *Deprecated:* - use tags ['runner', 'gitlab', 'awscdk']

- *Type:* `string`
- *Default:* tag2: awscdk .

Gitlab Runner register tag2  .

---

##### ~~`tag3`~~<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.tag3"></a>

- *Deprecated:* - use tags ['runner', 'gitlab', 'awscdk']

- *Type:* `string`
- *Default:* tag3: runner .

Gitlab Runner register tag3  .

---

##### `tags`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.tags"></a>

- *Type:* `string`[]
- *Default:* ['runner', 'gitlab', 'awscdk']

tags for the runner.

---

##### `validUntil`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.validUntil"></a>

- *Type:* `string`
- *Default:* no expiration , !!! only support spotfleet runner !!! .

the time when the spot fleet allocation expires.

---

##### `vpcSubnet`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabContainerRunnerProps.property.vpcSubnet"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* public subnet

VPC subnet for the spot fleet.

---

### GitlabRunnerAutoscalingProps <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps"></a>

GitlabRunnerAutoscaling Props.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { GitlabRunnerAutoscalingProps } from 'cdk-gitlab-runner'

const gitlabRunnerAutoscalingProps: GitlabRunnerAutoscalingProps = { ... }
```

##### `gitlabToken`<sup>Required</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.gitlabToken"></a>

- *Type:* `string`

Gitlab token.

---

##### `alarms`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.alarms"></a>

- *Type:* `object`[]
- *Default:* [{
AlarmName: 'GitlabRunnerDiskUsage',
MetricName: 'disk_used_percent',
}]

Parameters of put_metric_alarm function.

https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/cloudwatch.html#CloudWatch.Client.put_metric_alarm

---

##### `desiredCapacity`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.desiredCapacity"></a>

- *Type:* `number`
- *Default:* minCapacity, and leave unchanged during deployment

Desired capacity limit for autoscaling group.

---

##### `dockerVolumes`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.dockerVolumes"></a>

- *Type:* [`cdk-gitlab-runner.DockerVolumes`](#cdk-gitlab-runner.DockerVolumes)[]
- *Default:* already mount "/var/run/docker.sock:/var/run/docker.sock"

add another Gitlab Container Runner Docker Volumes Path at job runner runtime.

more detail see https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section

---

##### `ebsSize`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.ebsSize"></a>

- *Type:* `number`
- *Default:* ebsSize=60

Gitlab Runner instance EBS size .

---

##### `gitlabRunnerImage`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.gitlabRunnerImage"></a>

- *Type:* `string`
- *Default:* public.ecr.aws/gitlab/gitlab-runner:alpine

Image URL of Gitlab Runner.

---

##### `gitlabUrl`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.gitlabUrl"></a>

- *Type:* `string`
- *Default:* https://gitlab.com/ , The trailing slash is mandatory.

Gitlab Runner register url .

---

##### `instanceRole`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.instanceRole"></a>

- *Type:* [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole)
- *Default:* new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .

IAM role for the Gitlab Runner Instance .

---

##### `instanceType`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.instanceType"></a>

- *Type:* `string`
- *Default:* t3.micro

Runner default EC2 instance type.

---

##### `maxCapacity`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.maxCapacity"></a>

- *Type:* `number`
- *Default:* desiredCapacity

Maximum capacity limit for autoscaling group.

---

##### `minCapacity`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.minCapacity"></a>

- *Type:* `number`
- *Default:* minCapacity: 1

Minimum capacity limit for autoscaling group.

---

##### `spotInstance`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.spotInstance"></a>

- *Type:* `boolean`
- *Default:* false

Run worker nodes as EC2 Spot.

---

##### `tags`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.tags"></a>

- *Type:* `string`[]
- *Default:* ['runner', 'gitlab', 'awscdk']

tags for the runner.

---

##### `vpc`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.vpc"></a>

- *Type:* [`@aws-cdk/aws-ec2.IVpc`](#@aws-cdk/aws-ec2.IVpc)
- *Default:* A new VPC will be created.

VPC for the Gitlab Runner .

---

##### `vpcSubnet`<sup>Optional</sup> <a name="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.vpcSubnet"></a>

- *Type:* [`@aws-cdk/aws-ec2.SubnetSelection`](#@aws-cdk/aws-ec2.SubnetSelection)
- *Default:* private subnet

VPC subnet.

---



## Enums <a name="Enums"></a>

### BlockDuration <a name="BlockDuration"></a>

BlockDuration enum.

#### `ONE_HOUR` <a name="cdk-gitlab-runner.BlockDuration.ONE_HOUR"></a>

one hours.

---


#### `TWO_HOURS` <a name="cdk-gitlab-runner.BlockDuration.TWO_HOURS"></a>

two hours.

---


#### `THREE_HOURS` <a name="cdk-gitlab-runner.BlockDuration.THREE_HOURS"></a>

three hours.

---


#### `FOUR_HOURS` <a name="cdk-gitlab-runner.BlockDuration.FOUR_HOURS"></a>

four hours.

---


#### `FIVE_HOURS` <a name="cdk-gitlab-runner.BlockDuration.FIVE_HOURS"></a>

five hours.

---


#### `SIX_HOURS` <a name="cdk-gitlab-runner.BlockDuration.SIX_HOURS"></a>

six hours.

---


#### `SEVEN_HOURS` <a name="cdk-gitlab-runner.BlockDuration.SEVEN_HOURS"></a>

seven hours.

---


#### `EIGHT_HOURS` <a name="cdk-gitlab-runner.BlockDuration.EIGHT_HOURS"></a>

eight hours.

---


#### `NINE_HOURS` <a name="cdk-gitlab-runner.BlockDuration.NINE_HOURS"></a>

nine hours.

---


#### `TEN_HOURS` <a name="cdk-gitlab-runner.BlockDuration.TEN_HOURS"></a>

ten hours.

---


#### `ELEVEN_HOURS` <a name="cdk-gitlab-runner.BlockDuration.ELEVEN_HOURS"></a>

eleven hours.

---


#### `TWELVE_HOURS` <a name="cdk-gitlab-runner.BlockDuration.TWELVE_HOURS"></a>

twelve hours.

---


#### `THIRTEEN_HOURS` <a name="cdk-gitlab-runner.BlockDuration.THIRTEEN_HOURS"></a>

thirteen hours.

---


#### `FOURTEEN_HOURS` <a name="cdk-gitlab-runner.BlockDuration.FOURTEEN_HOURS"></a>

fourteen hours.

---


#### `FIFTEEN_HOURS` <a name="cdk-gitlab-runner.BlockDuration.FIFTEEN_HOURS"></a>

fifteen hours.

---


#### `SIXTEEN_HOURS` <a name="cdk-gitlab-runner.BlockDuration.SIXTEEN_HOURS"></a>

sixteen hours.

---


#### `SEVENTEEN_HOURS` <a name="cdk-gitlab-runner.BlockDuration.SEVENTEEN_HOURS"></a>

seventeen hours.

---


#### `EIGHTTEEN_HOURS` <a name="cdk-gitlab-runner.BlockDuration.EIGHTTEEN_HOURS"></a>

eightteen hours.

---


#### `NINETEEN_HOURS` <a name="cdk-gitlab-runner.BlockDuration.NINETEEN_HOURS"></a>

nineteen hours.

---


#### `TWENTY_HOURS` <a name="cdk-gitlab-runner.BlockDuration.TWENTY_HOURS"></a>

twenty hours.

---


### InstanceInterruptionBehavior <a name="InstanceInterruptionBehavior"></a>

InstanceInterruptionBehavior enum.

#### `HIBERNATE` <a name="cdk-gitlab-runner.InstanceInterruptionBehavior.HIBERNATE"></a>

hibernate.

---


#### `STOP` <a name="cdk-gitlab-runner.InstanceInterruptionBehavior.STOP"></a>

stop.

---


#### `TERMINATE` <a name="cdk-gitlab-runner.InstanceInterruptionBehavior.TERMINATE"></a>

terminate.

---

