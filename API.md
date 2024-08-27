# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### GitlabContainerRunner <a name="GitlabContainerRunner" id="cdk-gitlab-runner.GitlabContainerRunner"></a>

GitlabContainerRunner Construct for create a Gitlab Runner.

#### Initializers <a name="Initializers" id="cdk-gitlab-runner.GitlabContainerRunner.Initializer"></a>

```typescript
import { GitlabContainerRunner } from 'cdk-gitlab-runner'

new GitlabContainerRunner(scope: Construct, id: string, props: GitlabContainerRunnerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | *No description.* |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps">GitlabContainerRunnerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-gitlab-runner.GitlabContainerRunner.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-gitlab-runner.GitlabContainerRunner.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-gitlab-runner.GitlabContainerRunner.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-gitlab-runner.GitlabContainerRunnerProps">GitlabContainerRunnerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.createUserData">createUserData</a></code> | *No description.* |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.expireAfter">expireAfter</a></code> | Add expire time function for spotfleet runner !!! . |

---

##### `toString` <a name="toString" id="cdk-gitlab-runner.GitlabContainerRunner.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `createUserData` <a name="createUserData" id="cdk-gitlab-runner.GitlabContainerRunner.createUserData"></a>

```typescript
public createUserData(props: GitlabContainerRunnerProps, bucketName: string): string[]
```

###### `props`<sup>Required</sup> <a name="props" id="cdk-gitlab-runner.GitlabContainerRunner.createUserData.parameter.props"></a>

- *Type:* <a href="#cdk-gitlab-runner.GitlabContainerRunnerProps">GitlabContainerRunnerProps</a>

---

###### `bucketName`<sup>Required</sup> <a name="bucketName" id="cdk-gitlab-runner.GitlabContainerRunner.createUserData.parameter.bucketName"></a>

- *Type:* string

the bucketName to put gitlab runner token.

---

##### `expireAfter` <a name="expireAfter" id="cdk-gitlab-runner.GitlabContainerRunner.expireAfter"></a>

```typescript
public expireAfter(duration: Duration): void
```

Add expire time function for spotfleet runner !!! .

###### `duration`<sup>Required</sup> <a name="duration" id="cdk-gitlab-runner.GitlabContainerRunner.expireAfter.parameter.duration"></a>

- *Type:* @aws-cdk/core.Duration

Block duration.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="cdk-gitlab-runner.GitlabContainerRunner.isConstruct"></a>

```typescript
import { GitlabContainerRunner } from 'cdk-gitlab-runner'

GitlabContainerRunner.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-gitlab-runner.GitlabContainerRunner.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.property.defaultRunnerSG">defaultRunnerSG</a></code> | <code>@aws-cdk/aws-ec2.ISecurityGroup</code> | The EC2 runner's default SecurityGroup. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.property.runnerEc2">runnerEc2</a></code> | <code>@aws-cdk/aws-ec2.IInstance</code> | This represents a Runner EC2 instance , !!! only support On-demand runner instance !!! |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.property.runnerRole">runnerRole</a></code> | <code>@aws-cdk/aws-iam.IRole</code> | The IAM role assumed by the Runner instance . |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.property.spotFleetInstanceId">spotFleetInstanceId</a></code> | <code>string</code> | the first instance id in this fleet , !!! only support spotfleet runner !!! |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.property.spotFleetRequestId">spotFleetRequestId</a></code> | <code>string</code> | SpotFleetRequestId for this spot fleet , !!! only support spotfleet runner !!! |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunner.property.vpc">vpc</a></code> | <code>@aws-cdk/aws-ec2.IVpc</code> | The EC2 runner's vpc. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-gitlab-runner.GitlabContainerRunner.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `defaultRunnerSG`<sup>Required</sup> <a name="defaultRunnerSG" id="cdk-gitlab-runner.GitlabContainerRunner.property.defaultRunnerSG"></a>

```typescript
public readonly defaultRunnerSG: ISecurityGroup;
```

- *Type:* @aws-cdk/aws-ec2.ISecurityGroup

The EC2 runner's default SecurityGroup.

---

##### `runnerEc2`<sup>Required</sup> <a name="runnerEc2" id="cdk-gitlab-runner.GitlabContainerRunner.property.runnerEc2"></a>

```typescript
public readonly runnerEc2: IInstance;
```

- *Type:* @aws-cdk/aws-ec2.IInstance

This represents a Runner EC2 instance , !!! only support On-demand runner instance !!!

---

##### `runnerRole`<sup>Required</sup> <a name="runnerRole" id="cdk-gitlab-runner.GitlabContainerRunner.property.runnerRole"></a>

```typescript
public readonly runnerRole: IRole;
```

- *Type:* @aws-cdk/aws-iam.IRole

The IAM role assumed by the Runner instance .

---

##### `spotFleetInstanceId`<sup>Required</sup> <a name="spotFleetInstanceId" id="cdk-gitlab-runner.GitlabContainerRunner.property.spotFleetInstanceId"></a>

```typescript
public readonly spotFleetInstanceId: string;
```

- *Type:* string

the first instance id in this fleet , !!! only support spotfleet runner !!!

---

##### `spotFleetRequestId`<sup>Required</sup> <a name="spotFleetRequestId" id="cdk-gitlab-runner.GitlabContainerRunner.property.spotFleetRequestId"></a>

```typescript
public readonly spotFleetRequestId: string;
```

- *Type:* string

SpotFleetRequestId for this spot fleet , !!! only support spotfleet runner !!!

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="cdk-gitlab-runner.GitlabContainerRunner.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* @aws-cdk/aws-ec2.IVpc

The EC2 runner's vpc.

---


### GitlabRunnerAutoscaling <a name="GitlabRunnerAutoscaling" id="cdk-gitlab-runner.GitlabRunnerAutoscaling"></a>

GitlabRunnerAutoscaling Construct for create Autoscaling Gitlab Runner.

#### Initializers <a name="Initializers" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.Initializer"></a>

```typescript
import { GitlabRunnerAutoscaling } from 'cdk-gitlab-runner'

new GitlabRunnerAutoscaling(scope: Construct, id: string, props: GitlabRunnerAutoscalingProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.Initializer.parameter.scope">scope</a></code> | <code>@aws-cdk/core.Construct</code> | *No description.* |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps">GitlabRunnerAutoscalingProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.Initializer.parameter.scope"></a>

- *Type:* @aws-cdk/core.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps">GitlabRunnerAutoscalingProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.createUserData">createUserData</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `createUserData` <a name="createUserData" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.createUserData"></a>

```typescript
public createUserData(props: GitlabRunnerAutoscalingProps): string[]
```

###### `props`<sup>Required</sup> <a name="props" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.createUserData.parameter.props"></a>

- *Type:* <a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps">GitlabRunnerAutoscalingProps</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.isConstruct">isConstruct</a></code> | Return whether the given object is a Construct. |

---

##### `isConstruct` <a name="isConstruct" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.isConstruct"></a>

```typescript
import { GitlabRunnerAutoscaling } from 'cdk-gitlab-runner'

GitlabRunnerAutoscaling.isConstruct(x: any)
```

Return whether the given object is a Construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.isConstruct.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.property.node">node</a></code> | <code>@aws-cdk/core.ConstructNode</code> | The construct tree node associated with this construct. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.property.autoscalingGroup">autoscalingGroup</a></code> | <code>@aws-cdk/aws-autoscaling.AutoScalingGroup</code> | This represents a Runner Auto Scaling Group. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.property.instanceRole">instanceRole</a></code> | <code>@aws-cdk/aws-iam.IRole</code> | The IAM role assumed by the Runner instance. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.property.securityGroup">securityGroup</a></code> | <code>@aws-cdk/aws-ec2.ISecurityGroup</code> | The EC2 runner's default SecurityGroup. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.property.topicAlarm">topicAlarm</a></code> | <code>@aws-cdk/aws-sns.ITopic</code> | The SNS topic to suscribe alarms for EC2 runner's metrics. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscaling.property.vpc">vpc</a></code> | <code>@aws-cdk/aws-ec2.IVpc</code> | The EC2 runner's VPC. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.node"></a>

```typescript
public readonly node: ConstructNode;
```

- *Type:* @aws-cdk/core.ConstructNode

The construct tree node associated with this construct.

---

##### `autoscalingGroup`<sup>Required</sup> <a name="autoscalingGroup" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.autoscalingGroup"></a>

```typescript
public readonly autoscalingGroup: AutoScalingGroup;
```

- *Type:* @aws-cdk/aws-autoscaling.AutoScalingGroup

This represents a Runner Auto Scaling Group.

---

##### `instanceRole`<sup>Required</sup> <a name="instanceRole" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.instanceRole"></a>

```typescript
public readonly instanceRole: IRole;
```

- *Type:* @aws-cdk/aws-iam.IRole

The IAM role assumed by the Runner instance.

---

##### `securityGroup`<sup>Required</sup> <a name="securityGroup" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.securityGroup"></a>

```typescript
public readonly securityGroup: ISecurityGroup;
```

- *Type:* @aws-cdk/aws-ec2.ISecurityGroup

The EC2 runner's default SecurityGroup.

---

##### `topicAlarm`<sup>Required</sup> <a name="topicAlarm" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.topicAlarm"></a>

```typescript
public readonly topicAlarm: ITopic;
```

- *Type:* @aws-cdk/aws-sns.ITopic

The SNS topic to suscribe alarms for EC2 runner's metrics.

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="cdk-gitlab-runner.GitlabRunnerAutoscaling.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* @aws-cdk/aws-ec2.IVpc

The EC2 runner's VPC.

---


## Structs <a name="Structs" id="Structs"></a>

### DockerVolumes <a name="DockerVolumes" id="cdk-gitlab-runner.DockerVolumes"></a>

Docker Volumes interface.

#### Initializer <a name="Initializer" id="cdk-gitlab-runner.DockerVolumes.Initializer"></a>

```typescript
import { DockerVolumes } from 'cdk-gitlab-runner'

const dockerVolumes: DockerVolumes = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-gitlab-runner.DockerVolumes.property.containerPath">containerPath</a></code> | <code>string</code> | Job Runtime Container Path Host Path. |
| <code><a href="#cdk-gitlab-runner.DockerVolumes.property.hostPath">hostPath</a></code> | <code>string</code> | EC2 Runner Host Path. |

---

##### `containerPath`<sup>Required</sup> <a name="containerPath" id="cdk-gitlab-runner.DockerVolumes.property.containerPath"></a>

```typescript
public readonly containerPath: string;
```

- *Type:* string

Job Runtime Container Path Host Path.

---

*Example*

```typescript
- /tmp/cahce
more detail see https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section
```


##### `hostPath`<sup>Required</sup> <a name="hostPath" id="cdk-gitlab-runner.DockerVolumes.property.hostPath"></a>

```typescript
public readonly hostPath: string;
```

- *Type:* string

EC2 Runner Host Path.

---

*Example*

```typescript
- /tmp/cahce
more detail see https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section
```


### GitlabContainerRunnerProps <a name="GitlabContainerRunnerProps" id="cdk-gitlab-runner.GitlabContainerRunnerProps"></a>

GitlabContainerRunner Props.

#### Initializer <a name="Initializer" id="cdk-gitlab-runner.GitlabContainerRunnerProps.Initializer"></a>

```typescript
import { GitlabContainerRunnerProps } from 'cdk-gitlab-runner'

const gitlabContainerRunnerProps: GitlabContainerRunnerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.gitlabtoken">gitlabtoken</a></code> | <code>string</code> | Gitlab token for the Register Runner . |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.blockDuration">blockDuration</a></code> | <code><a href="#cdk-gitlab-runner.BlockDuration">BlockDuration</a></code> | Reservce the Spot Runner instance as spot block with defined duration. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.dockerVolumes">dockerVolumes</a></code> | <code><a href="#cdk-gitlab-runner.DockerVolumes">DockerVolumes</a>[]</code> | add another Gitlab Container Runner Docker Volumes Path at job runner runtime. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.ebsSize">ebsSize</a></code> | <code>number</code> | Gitlab Runner instance EBS size . |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.ec2iamrole">ec2iamrole</a></code> | <code>@aws-cdk/aws-iam.IRole</code> | IAM role for the Gitlab Runner Instance . |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.ec2type">ec2type</a></code> | <code>string</code> | Runner default EC2 instance type. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.gitlabRunnerImage">gitlabRunnerImage</a></code> | <code>string</code> | Image URL of Gitlab Runner. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.gitlaburl">gitlaburl</a></code> | <code>string</code> | Gitlab Runner register url . |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.instanceInterruptionBehavior">instanceInterruptionBehavior</a></code> | <code><a href="#cdk-gitlab-runner.InstanceInterruptionBehavior">InstanceInterruptionBehavior</a></code> | The behavior when a Spot Runner Instance is interrupted. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.keyName">keyName</a></code> | <code>string</code> | SSH key name. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.selfvpc">selfvpc</a></code> | <code>@aws-cdk/aws-ec2.IVpc</code> | VPC for the Gitlab Runner . |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.spotFleet">spotFleet</a></code> | <code>boolean</code> | Gitlab Runner instance Use Spot Fleet or not ?!. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.tag1">tag1</a></code> | <code>string</code> | Gitlab Runner register tag1  . |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.tag2">tag2</a></code> | <code>string</code> | Gitlab Runner register tag2  . |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.tag3">tag3</a></code> | <code>string</code> | Gitlab Runner register tag3  . |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.tags">tags</a></code> | <code>string[]</code> | tags for the runner. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.validUntil">validUntil</a></code> | <code>string</code> | the time when the spot fleet allocation expires. |
| <code><a href="#cdk-gitlab-runner.GitlabContainerRunnerProps.property.vpcSubnet">vpcSubnet</a></code> | <code>@aws-cdk/aws-ec2.SubnetSelection</code> | VPC subnet for the spot fleet. |

---

##### `gitlabtoken`<sup>Required</sup> <a name="gitlabtoken" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.gitlabtoken"></a>

```typescript
public readonly gitlabtoken: string;
```

- *Type:* string
- *Default:* You must to give the token !!!

Gitlab token for the Register Runner .

---

*Example*

```typescript
new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN' });
```


##### `blockDuration`<sup>Optional</sup> <a name="blockDuration" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.blockDuration"></a>

```typescript
public readonly blockDuration: BlockDuration;
```

- *Type:* <a href="#cdk-gitlab-runner.BlockDuration">BlockDuration</a>
- *Default:* BlockDuration.ONE_HOUR , !!! only support spotfleet runner !!! .

Reservce the Spot Runner instance as spot block with defined duration.

---

##### `dockerVolumes`<sup>Optional</sup> <a name="dockerVolumes" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.dockerVolumes"></a>

```typescript
public readonly dockerVolumes: DockerVolumes[];
```

- *Type:* <a href="#cdk-gitlab-runner.DockerVolumes">DockerVolumes</a>[]
- *Default:* already mount "/var/run/docker.sock:/var/run/docker.sock"

add another Gitlab Container Runner Docker Volumes Path at job runner runtime.

more detail see https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section

---

*Example*

```typescript
dockerVolumes: [
  {
    hostPath: '/tmp/cache',
    containerPath: '/tmp/cache',
  },
],
```


##### `ebsSize`<sup>Optional</sup> <a name="ebsSize" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.ebsSize"></a>

```typescript
public readonly ebsSize: number;
```

- *Type:* number
- *Default:* ebsSize=60

Gitlab Runner instance EBS size .

---

*Example*

```typescript
const runner = new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN',ebsSize: 100});
```


##### `ec2iamrole`<sup>Optional</sup> <a name="ec2iamrole" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.ec2iamrole"></a>

```typescript
public readonly ec2iamrole: IRole;
```

- *Type:* @aws-cdk/aws-iam.IRole
- *Default:* new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .

IAM role for the Gitlab Runner Instance .

---

*Example*

```typescript
const role = new Role(stack, 'runner-role', {
  assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
  description: 'For Gitlab EC2 Runner Test Role',
  roleName: 'Myself-Runner-Role',
});

new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', ec2iamrole: role });
```


##### `ec2type`<sup>Optional</sup> <a name="ec2type" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.ec2type"></a>

```typescript
public readonly ec2type: string;
```

- *Type:* string
- *Default:* t3.micro

Runner default EC2 instance type.

---

*Example*

```typescript
new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', ec2type: 't3.small' });
```


##### `gitlabRunnerImage`<sup>Optional</sup> <a name="gitlabRunnerImage" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.gitlabRunnerImage"></a>

```typescript
public readonly gitlabRunnerImage: string;
```

- *Type:* string
- *Default:* public.ecr.aws/gitlab/gitlab-runner:latest

Image URL of Gitlab Runner.

---

*Example*

```typescript
new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', gitlabRunnerImage: 'gitlab/gitlab-runner:alpine' });
```


##### `gitlaburl`<sup>Optional</sup> <a name="gitlaburl" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.gitlaburl"></a>

```typescript
public readonly gitlaburl: string;
```

- *Type:* string
- *Default:* gitlaburl='https://gitlab.com/' , please use https://yourgitlab.com/ do not use https://yourgitlab.com

Gitlab Runner register url .

---

*Example*

```typescript
const runner = new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN',gitlaburl: 'https://gitlab.com/'});
```


##### `instanceInterruptionBehavior`<sup>Optional</sup> <a name="instanceInterruptionBehavior" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.instanceInterruptionBehavior"></a>

```typescript
public readonly instanceInterruptionBehavior: InstanceInterruptionBehavior;
```

- *Type:* <a href="#cdk-gitlab-runner.InstanceInterruptionBehavior">InstanceInterruptionBehavior</a>
- *Default:* InstanceInterruptionBehavior.TERMINATE , !!! only support spotfleet runner !!! .

The behavior when a Spot Runner Instance is interrupted.

---

##### `keyName`<sup>Optional</sup> <a name="keyName" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.keyName"></a>

```typescript
public readonly keyName: string;
```

- *Type:* string
- *Default:* no ssh key will be assigned , !!! only support spotfleet runner !!! .

SSH key name.

---

##### `selfvpc`<sup>Optional</sup> <a name="selfvpc" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.selfvpc"></a>

```typescript
public readonly selfvpc: IVpc;
```

- *Type:* @aws-cdk/aws-ec2.IVpc
- *Default:* new VPC will be created , 1 Vpc , 2 Public Subnet .

VPC for the Gitlab Runner .

---

*Example*

```typescript
const newvpc = new Vpc(stack, 'NEWVPC', {
  cidr: '10.1.0.0/16',
  maxAzs: 2,
  subnetConfiguration: [{
    cidrMask: 26,
    name: 'RunnerVPC',
    subnetType: SubnetType.PUBLIC,
  }],
  natGateways: 0,
});

new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', selfvpc: newvpc });
```


##### `spotFleet`<sup>Optional</sup> <a name="spotFleet" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.spotFleet"></a>

```typescript
public readonly spotFleet: boolean;
```

- *Type:* boolean
- *Default:* spotFleet=false

Gitlab Runner instance Use Spot Fleet or not ?!.

---

*Example*

```typescript
const runner = new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN',spotFleet: true});
```


##### ~~`tag1`~~<sup>Optional</sup> <a name="tag1" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.tag1"></a>

- *Deprecated:* - use tags ['runner', 'gitlab', 'awscdk']

```typescript
public readonly tag1: string;
```

- *Type:* string
- *Default:* tag1: gitlab .

Gitlab Runner register tag1  .

---

*Example*

```typescript
new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', tag1: 'aa' });
```


##### ~~`tag2`~~<sup>Optional</sup> <a name="tag2" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.tag2"></a>

- *Deprecated:* - use tags ['runner', 'gitlab', 'awscdk']

```typescript
public readonly tag2: string;
```

- *Type:* string
- *Default:* tag2: awscdk .

Gitlab Runner register tag2  .

---

*Example*

```typescript
new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', tag2: 'bb' });
```


##### ~~`tag3`~~<sup>Optional</sup> <a name="tag3" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.tag3"></a>

- *Deprecated:* - use tags ['runner', 'gitlab', 'awscdk']

```typescript
public readonly tag3: string;
```

- *Type:* string
- *Default:* tag3: runner .

Gitlab Runner register tag3  .

---

*Example*

```typescript
new GitlabContainerRunner(stack, 'runner', { gitlabtoken: 'GITLAB_TOKEN', tag3: 'cc' });
```


##### `tags`<sup>Optional</sup> <a name="tags" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.tags"></a>

```typescript
public readonly tags: string[];
```

- *Type:* string[]
- *Default:* ['runner', 'gitlab', 'awscdk']

tags for the runner.

---

##### `validUntil`<sup>Optional</sup> <a name="validUntil" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.validUntil"></a>

```typescript
public readonly validUntil: string;
```

- *Type:* string
- *Default:* no expiration , !!! only support spotfleet runner !!! .

the time when the spot fleet allocation expires.

---

##### `vpcSubnet`<sup>Optional</sup> <a name="vpcSubnet" id="cdk-gitlab-runner.GitlabContainerRunnerProps.property.vpcSubnet"></a>

```typescript
public readonly vpcSubnet: SubnetSelection;
```

- *Type:* @aws-cdk/aws-ec2.SubnetSelection
- *Default:* public subnet

VPC subnet for the spot fleet.

---

*Example*

```typescript
const vpc = new Vpc(stack, 'nat', {
natGateways: 1,
maxAzs: 2,
});
const runner = new GitlabContainerRunner(stack, 'testing', {
  gitlabtoken: 'GITLAB_TOKEN',
  ec2type: 't3.large',
  ec2iamrole: role,
  ebsSize: 100,
  selfvpc: vpc,
  vpcSubnet: {
    subnetType: SubnetType.PUBLIC,
  },
});
```


### GitlabRunnerAutoscalingProps <a name="GitlabRunnerAutoscalingProps" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps"></a>

GitlabRunnerAutoscaling Props.

#### Initializer <a name="Initializer" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.Initializer"></a>

```typescript
import { GitlabRunnerAutoscalingProps } from 'cdk-gitlab-runner'

const gitlabRunnerAutoscalingProps: GitlabRunnerAutoscalingProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.gitlabToken">gitlabToken</a></code> | <code>string</code> | Gitlab token. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.alarms">alarms</a></code> | <code>object[]</code> | Parameters of put_metric_alarm function. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.desiredCapacity">desiredCapacity</a></code> | <code>number</code> | Desired capacity limit for autoscaling group. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.dockerVolumes">dockerVolumes</a></code> | <code><a href="#cdk-gitlab-runner.DockerVolumes">DockerVolumes</a>[]</code> | add another Gitlab Container Runner Docker Volumes Path at job runner runtime. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.ebsSize">ebsSize</a></code> | <code>number</code> | Gitlab Runner instance EBS size . |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.gitlabRunnerImage">gitlabRunnerImage</a></code> | <code>string</code> | Image URL of Gitlab Runner. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.gitlabUrl">gitlabUrl</a></code> | <code>string</code> | Gitlab Runner register url . |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.instanceRole">instanceRole</a></code> | <code>@aws-cdk/aws-iam.IRole</code> | IAM role for the Gitlab Runner Instance . |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.instanceType">instanceType</a></code> | <code>string</code> | Runner default EC2 instance type. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.maxCapacity">maxCapacity</a></code> | <code>number</code> | Maximum capacity limit for autoscaling group. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.minCapacity">minCapacity</a></code> | <code>number</code> | Minimum capacity limit for autoscaling group. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.spotInstance">spotInstance</a></code> | <code>boolean</code> | Run worker nodes as EC2 Spot. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.tags">tags</a></code> | <code>string[]</code> | tags for the runner. |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.vpc">vpc</a></code> | <code>@aws-cdk/aws-ec2.IVpc</code> | VPC for the Gitlab Runner . |
| <code><a href="#cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.vpcSubnet">vpcSubnet</a></code> | <code>@aws-cdk/aws-ec2.SubnetSelection</code> | VPC subnet. |

---

##### `gitlabToken`<sup>Required</sup> <a name="gitlabToken" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.gitlabToken"></a>

```typescript
public readonly gitlabToken: string;
```

- *Type:* string

Gitlab token.

---

*Example*

```typescript
new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN' });
```


##### `alarms`<sup>Optional</sup> <a name="alarms" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.alarms"></a>

```typescript
public readonly alarms: object[];
```

- *Type:* object[]
- *Default:* [{ AlarmName: 'GitlabRunnerDiskUsage', MetricName: 'disk_used_percent', }]

Parameters of put_metric_alarm function.

https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/cloudwatch.html#CloudWatch.Client.put_metric_alarm

---

##### `desiredCapacity`<sup>Optional</sup> <a name="desiredCapacity" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.desiredCapacity"></a>

```typescript
public readonly desiredCapacity: number;
```

- *Type:* number
- *Default:* minCapacity, and leave unchanged during deployment

Desired capacity limit for autoscaling group.

---

*Example*

```typescript
new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', desiredCapacity: 2 });
```


##### `dockerVolumes`<sup>Optional</sup> <a name="dockerVolumes" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.dockerVolumes"></a>

```typescript
public readonly dockerVolumes: DockerVolumes[];
```

- *Type:* <a href="#cdk-gitlab-runner.DockerVolumes">DockerVolumes</a>[]
- *Default:* already mount "/var/run/docker.sock:/var/run/docker.sock"

add another Gitlab Container Runner Docker Volumes Path at job runner runtime.

more detail see https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section

---

*Example*

```typescript
dockerVolumes: [
  {
    hostPath: '/tmp/cache',
    containerPath: '/tmp/cache',
  },
],
```


##### `ebsSize`<sup>Optional</sup> <a name="ebsSize" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.ebsSize"></a>

```typescript
public readonly ebsSize: number;
```

- *Type:* number
- *Default:* ebsSize=60

Gitlab Runner instance EBS size .

---

*Example*

```typescript
const runner = new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', ebsSize: 100});
```


##### `gitlabRunnerImage`<sup>Optional</sup> <a name="gitlabRunnerImage" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.gitlabRunnerImage"></a>

```typescript
public readonly gitlabRunnerImage: string;
```

- *Type:* string
- *Default:* public.ecr.aws/gitlab/gitlab-runner:latest

Image URL of Gitlab Runner.

---

*Example*

```typescript
new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', gitlabRunnerImage: 'gitlab/gitlab-runner:alpine' });
```


##### `gitlabUrl`<sup>Optional</sup> <a name="gitlabUrl" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.gitlabUrl"></a>

```typescript
public readonly gitlabUrl: string;
```

- *Type:* string
- *Default:* https://gitlab.com/ , The trailing slash is mandatory.

Gitlab Runner register url .

---

*Example*

```typescript
const runner = new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN',gitlabUrl: 'https://gitlab.com/'});
```


##### `instanceRole`<sup>Optional</sup> <a name="instanceRole" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.instanceRole"></a>

```typescript
public readonly instanceRole: IRole;
```

- *Type:* @aws-cdk/aws-iam.IRole
- *Default:* new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .

IAM role for the Gitlab Runner Instance .

---

*Example*

```typescript
const role = new Role(stack, 'runner-role', {
  assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
  description: 'For Gitlab Runner Test Role',
  roleName: 'Runner-Role',
});

new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', instanceRole: role });
```


##### `instanceType`<sup>Optional</sup> <a name="instanceType" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.instanceType"></a>

```typescript
public readonly instanceType: string;
```

- *Type:* string
- *Default:* t3.micro

Runner default EC2 instance type.

---

*Example*

```typescript
new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', instanceType: 't3.small' });
```


##### `maxCapacity`<sup>Optional</sup> <a name="maxCapacity" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.maxCapacity"></a>

```typescript
public readonly maxCapacity: number;
```

- *Type:* number
- *Default:* desiredCapacity

Maximum capacity limit for autoscaling group.

---

*Example*

```typescript
new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', maxCapacity: 4 });
```


##### `minCapacity`<sup>Optional</sup> <a name="minCapacity" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.minCapacity"></a>

```typescript
public readonly minCapacity: number;
```

- *Type:* number
- *Default:* minCapacity: 1

Minimum capacity limit for autoscaling group.

---

*Example*

```typescript
new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', minCapacity: 2 });
```


##### `spotInstance`<sup>Optional</sup> <a name="spotInstance" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.spotInstance"></a>

```typescript
public readonly spotInstance: boolean;
```

- *Type:* boolean
- *Default:* false

Run worker nodes as EC2 Spot.

---

##### `tags`<sup>Optional</sup> <a name="tags" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.tags"></a>

```typescript
public readonly tags: string[];
```

- *Type:* string[]
- *Default:* ['runner', 'gitlab', 'awscdk']

tags for the runner.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* @aws-cdk/aws-ec2.IVpc
- *Default:* A new VPC will be created.

VPC for the Gitlab Runner .

---

*Example*

```typescript
const newVpc = new Vpc(stack, 'NewVPC', {
  cidr: '10.1.0.0/16',
  maxAzs: 2,
  subnetConfiguration: [{
    cidrMask: 26,
    name: 'RunnerVPC',
    subnetType: SubnetType.PUBLIC,
  }],
  natGateways: 0,
});

new GitlabRunnerAutoscaling(stack, 'runner', { gitlabToken: 'GITLAB_TOKEN', vpc: newVpc });
```


##### `vpcSubnet`<sup>Optional</sup> <a name="vpcSubnet" id="cdk-gitlab-runner.GitlabRunnerAutoscalingProps.property.vpcSubnet"></a>

```typescript
public readonly vpcSubnet: SubnetSelection;
```

- *Type:* @aws-cdk/aws-ec2.SubnetSelection
- *Default:* private subnet

VPC subnet.

---

*Example*

```typescript
const vpc = new Vpc(stack, 'nat', {
natGateways: 1,
maxAzs: 2,
});
const runner = new GitlabRunnerAutoscaling(stack, 'testing', {
  gitlabToken: 'GITLAB_TOKEN',
  instanceType: 't3.large',
  instanceRole: role,
  ebsSize: 100,
  vpc: vpc,
  vpcSubnet: {
    subnetType: SubnetType.PUBLIC,
  },
});
```




## Enums <a name="Enums" id="Enums"></a>

### BlockDuration <a name="BlockDuration" id="cdk-gitlab-runner.BlockDuration"></a>

BlockDuration enum.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-gitlab-runner.BlockDuration.ONE_HOUR">ONE_HOUR</a></code> | one hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.TWO_HOURS">TWO_HOURS</a></code> | two hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.THREE_HOURS">THREE_HOURS</a></code> | three hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.FOUR_HOURS">FOUR_HOURS</a></code> | four hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.FIVE_HOURS">FIVE_HOURS</a></code> | five hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.SIX_HOURS">SIX_HOURS</a></code> | six hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.SEVEN_HOURS">SEVEN_HOURS</a></code> | seven hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.EIGHT_HOURS">EIGHT_HOURS</a></code> | eight hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.NINE_HOURS">NINE_HOURS</a></code> | nine hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.TEN_HOURS">TEN_HOURS</a></code> | ten hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.ELEVEN_HOURS">ELEVEN_HOURS</a></code> | eleven hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.TWELVE_HOURS">TWELVE_HOURS</a></code> | twelve hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.THIRTEEN_HOURS">THIRTEEN_HOURS</a></code> | thirteen hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.FOURTEEN_HOURS">FOURTEEN_HOURS</a></code> | fourteen hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.FIFTEEN_HOURS">FIFTEEN_HOURS</a></code> | fifteen hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.SIXTEEN_HOURS">SIXTEEN_HOURS</a></code> | sixteen hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.SEVENTEEN_HOURS">SEVENTEEN_HOURS</a></code> | seventeen hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.EIGHTTEEN_HOURS">EIGHTTEEN_HOURS</a></code> | eightteen hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.NINETEEN_HOURS">NINETEEN_HOURS</a></code> | nineteen hours. |
| <code><a href="#cdk-gitlab-runner.BlockDuration.TWENTY_HOURS">TWENTY_HOURS</a></code> | twenty hours. |

---

##### `ONE_HOUR` <a name="ONE_HOUR" id="cdk-gitlab-runner.BlockDuration.ONE_HOUR"></a>

one hours.

---


##### `TWO_HOURS` <a name="TWO_HOURS" id="cdk-gitlab-runner.BlockDuration.TWO_HOURS"></a>

two hours.

---


##### `THREE_HOURS` <a name="THREE_HOURS" id="cdk-gitlab-runner.BlockDuration.THREE_HOURS"></a>

three hours.

---


##### `FOUR_HOURS` <a name="FOUR_HOURS" id="cdk-gitlab-runner.BlockDuration.FOUR_HOURS"></a>

four hours.

---


##### `FIVE_HOURS` <a name="FIVE_HOURS" id="cdk-gitlab-runner.BlockDuration.FIVE_HOURS"></a>

five hours.

---


##### `SIX_HOURS` <a name="SIX_HOURS" id="cdk-gitlab-runner.BlockDuration.SIX_HOURS"></a>

six hours.

---


##### `SEVEN_HOURS` <a name="SEVEN_HOURS" id="cdk-gitlab-runner.BlockDuration.SEVEN_HOURS"></a>

seven hours.

---


##### `EIGHT_HOURS` <a name="EIGHT_HOURS" id="cdk-gitlab-runner.BlockDuration.EIGHT_HOURS"></a>

eight hours.

---


##### `NINE_HOURS` <a name="NINE_HOURS" id="cdk-gitlab-runner.BlockDuration.NINE_HOURS"></a>

nine hours.

---


##### `TEN_HOURS` <a name="TEN_HOURS" id="cdk-gitlab-runner.BlockDuration.TEN_HOURS"></a>

ten hours.

---


##### `ELEVEN_HOURS` <a name="ELEVEN_HOURS" id="cdk-gitlab-runner.BlockDuration.ELEVEN_HOURS"></a>

eleven hours.

---


##### `TWELVE_HOURS` <a name="TWELVE_HOURS" id="cdk-gitlab-runner.BlockDuration.TWELVE_HOURS"></a>

twelve hours.

---


##### `THIRTEEN_HOURS` <a name="THIRTEEN_HOURS" id="cdk-gitlab-runner.BlockDuration.THIRTEEN_HOURS"></a>

thirteen hours.

---


##### `FOURTEEN_HOURS` <a name="FOURTEEN_HOURS" id="cdk-gitlab-runner.BlockDuration.FOURTEEN_HOURS"></a>

fourteen hours.

---


##### `FIFTEEN_HOURS` <a name="FIFTEEN_HOURS" id="cdk-gitlab-runner.BlockDuration.FIFTEEN_HOURS"></a>

fifteen hours.

---


##### `SIXTEEN_HOURS` <a name="SIXTEEN_HOURS" id="cdk-gitlab-runner.BlockDuration.SIXTEEN_HOURS"></a>

sixteen hours.

---


##### `SEVENTEEN_HOURS` <a name="SEVENTEEN_HOURS" id="cdk-gitlab-runner.BlockDuration.SEVENTEEN_HOURS"></a>

seventeen hours.

---


##### `EIGHTTEEN_HOURS` <a name="EIGHTTEEN_HOURS" id="cdk-gitlab-runner.BlockDuration.EIGHTTEEN_HOURS"></a>

eightteen hours.

---


##### `NINETEEN_HOURS` <a name="NINETEEN_HOURS" id="cdk-gitlab-runner.BlockDuration.NINETEEN_HOURS"></a>

nineteen hours.

---


##### `TWENTY_HOURS` <a name="TWENTY_HOURS" id="cdk-gitlab-runner.BlockDuration.TWENTY_HOURS"></a>

twenty hours.

---


### InstanceInterruptionBehavior <a name="InstanceInterruptionBehavior" id="cdk-gitlab-runner.InstanceInterruptionBehavior"></a>

InstanceInterruptionBehavior enum.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-gitlab-runner.InstanceInterruptionBehavior.HIBERNATE">HIBERNATE</a></code> | hibernate. |
| <code><a href="#cdk-gitlab-runner.InstanceInterruptionBehavior.STOP">STOP</a></code> | stop. |
| <code><a href="#cdk-gitlab-runner.InstanceInterruptionBehavior.TERMINATE">TERMINATE</a></code> | terminate. |

---

##### `HIBERNATE` <a name="HIBERNATE" id="cdk-gitlab-runner.InstanceInterruptionBehavior.HIBERNATE"></a>

hibernate.

---


##### `STOP` <a name="STOP" id="cdk-gitlab-runner.InstanceInterruptionBehavior.STOP"></a>

stop.

---


##### `TERMINATE` <a name="TERMINATE" id="cdk-gitlab-runner.InstanceInterruptionBehavior.TERMINATE"></a>

terminate.

---

