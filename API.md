# API Reference

**Classes**

Name|Description
----|-----------
[GitlabContainerRunner](#cdk-gitlab-runner-gitlabcontainerrunner)|GitlabContainerRunner Construct for create a Gitlab Runner.
[GitlabRunnerAutoscaling](#cdk-gitlab-runner-gitlabrunnerautoscaling)|GitlabRunnerAutoscaling Construct for create Autoscaling Gitlab Runner.


**Structs**

Name|Description
----|-----------
[DockerVolumes](#cdk-gitlab-runner-dockervolumes)|Docker Volumes interface.
[GitlabContainerRunnerProps](#cdk-gitlab-runner-gitlabcontainerrunnerprops)|GitlabContainerRunner Props.
[GitlabRunnerAutoscalingProps](#cdk-gitlab-runner-gitlabrunnerautoscalingprops)|GitlabRunnerAutoscaling Props.


**Enums**

Name|Description
----|-----------
[BlockDuration](#cdk-gitlab-runner-blockduration)|BlockDuration enum.
[InstanceInterruptionBehavior](#cdk-gitlab-runner-instanceinterruptionbehavior)|InstanceInterruptionBehavior enum.



## class GitlabContainerRunner 🔹 <a id="cdk-gitlab-runner-gitlabcontainerrunner"></a>

GitlabContainerRunner Construct for create a Gitlab Runner.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new GitlabContainerRunner(scope: Construct, id: string, props: GitlabContainerRunnerProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[GitlabContainerRunnerProps](#cdk-gitlab-runner-gitlabcontainerrunnerprops)</code>)  *No description*
  * **gitlabtoken** (<code>string</code>)  Gitlab token for the Register Runner . 
  * **blockDuration** (<code>[BlockDuration](#cdk-gitlab-runner-blockduration)</code>)  Reservce the Spot Runner instance as spot block with defined duration. __*Default*__: BlockDuration.ONE_HOUR , !!! only support spotfleet runner !!! .
  * **dockerVolumes** (<code>Array<[DockerVolumes](#cdk-gitlab-runner-dockervolumes)></code>)  add another Gitlab Container Runner Docker Volumes Path at job runner runtime. __*Default*__: already mount "/var/run/docker.sock:/var/run/docker.sock"
  * **ebsSize** (<code>number</code>)  Gitlab Runner instance EBS size . __*Default*__: ebsSize=60
  * **ec2iamrole** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  IAM role for the Gitlab Runner Instance . __*Default*__: new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .
  * **ec2type** (<code>string</code>)  Runner default EC2 instance type. __*Default*__: t3.micro
  * **gitlabRunnerImage** (<code>string</code>)  Image URL of Gitlab Runner. __*Default*__: public.ecr.aws/gitlab/gitlab-runner:alpine
  * **gitlaburl** (<code>string</code>)  Gitlab Runner register url . __*Default*__: gitlaburl='https://gitlab.com/' , please use https://yourgitlab.com/ do not use https://yourgitlab.com
  * **instanceInterruptionBehavior** (<code>[InstanceInterruptionBehavior](#cdk-gitlab-runner-instanceinterruptionbehavior)</code>)  The behavior when a Spot Runner Instance is interrupted. __*Default*__: InstanceInterruptionBehavior.TERMINATE , !!! only support spotfleet runner !!! .
  * **keyName** (<code>string</code>)  SSH key name. __*Default*__: no ssh key will be assigned , !!! only support spotfleet runner !!! .
  * **selfvpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  VPC for the Gitlab Runner . __*Default*__: new VPC will be created , 1 Vpc , 2 Public Subnet .
  * **spotFleet** (<code>boolean</code>)  Gitlab Runner instance Use Spot Fleet or not ?!. __*Default*__: spotFleet=false
  * **tag1** (<code>string</code>)  Gitlab Runner register tag1  . __*Default*__: tag1: gitlab .
  * **tag2** (<code>string</code>)  Gitlab Runner register tag2  . __*Default*__: tag2: awscdk .
  * **tag3** (<code>string</code>)  Gitlab Runner register tag3  . __*Default*__: tag3: runner .
  * **tags** (<code>Array<string></code>)  tags for the runner. __*Default*__: ['runner', 'gitlab', 'awscdk']
  * **validUntil** (<code>string</code>)  the time when the spot fleet allocation expires. __*Default*__: no expiration , !!! only support spotfleet runner !!! .
  * **vpcSubnet** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  VPC subnet for the spot fleet. __*Default*__: public subnet



### Properties


Name | Type | Description 
-----|------|-------------
**defaultRunnerSG**🔹 | <code>[ISecurityGroup](#aws-cdk-aws-ec2-isecuritygroup)</code> | The EC2 runner's default SecurityGroup.
**runnerEc2**🔹 | <code>[IInstance](#aws-cdk-aws-ec2-iinstance)</code> | This represents a Runner EC2 instance , !!! only support On-demand runner instance !!!
**runnerRole**🔹 | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | The IAM role assumed by the Runner instance .
**spotFleetInstanceId**🔹 | <code>string</code> | the first instance id in this fleet , !!! only support spotfleet runner !!!
**spotFleetRequestId**🔹 | <code>string</code> | SpotFleetRequestId for this spot fleet , !!! only support spotfleet runner !!!
**vpc**🔹 | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The EC2 runner's vpc.

### Methods


#### createUserData(props, bucketName)🔹 <a id="cdk-gitlab-runner-gitlabcontainerrunner-createuserdata"></a>



```ts
createUserData(props: GitlabContainerRunnerProps, bucketName: string): Array<string>
```

* **props** (<code>[GitlabContainerRunnerProps](#cdk-gitlab-runner-gitlabcontainerrunnerprops)</code>)  *No description*
* **bucketName** (<code>string</code>)  - the bucketName to put gitlab runner token.

__Returns__:
* <code>Array<string></code>

#### expireAfter(duration)🔹 <a id="cdk-gitlab-runner-gitlabcontainerrunner-expireafter"></a>

Add expire time function for spotfleet runner !!! .

```ts
expireAfter(duration: Duration): void
```

* **duration** (<code>[Duration](#aws-cdk-core-duration)</code>)  - Block duration.






## class GitlabRunnerAutoscaling 🔹 <a id="cdk-gitlab-runner-gitlabrunnerautoscaling"></a>

GitlabRunnerAutoscaling Construct for create Autoscaling Gitlab Runner.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new GitlabRunnerAutoscaling(scope: Construct, id: string, props: GitlabRunnerAutoscalingProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[GitlabRunnerAutoscalingProps](#cdk-gitlab-runner-gitlabrunnerautoscalingprops)</code>)  *No description*
  * **gitlabToken** (<code>string</code>)  Gitlab token. 
  * **alarms** (<code>Array<json></code>)  Parameters of put_metric_alarm function. __*Default*__: [{ AlarmName: 'GitlabRunnerDiskUsage', MetricName: 'disk_used_percent', }]
  * **desiredCapacity** (<code>number</code>)  Desired capacity limit for autoscaling group. __*Default*__: minCapacity, and leave unchanged during deployment
  * **dockerVolumes** (<code>Array<[DockerVolumes](#cdk-gitlab-runner-dockervolumes)></code>)  add another Gitlab Container Runner Docker Volumes Path at job runner runtime. __*Default*__: already mount "/var/run/docker.sock:/var/run/docker.sock"
  * **ebsSize** (<code>number</code>)  Gitlab Runner instance EBS size . __*Default*__: ebsSize=60
  * **gitlabRunnerImage** (<code>string</code>)  Image URL of Gitlab Runner. __*Default*__: public.ecr.aws/gitlab/gitlab-runner:alpine
  * **gitlabUrl** (<code>string</code>)  Gitlab Runner register url . __*Default*__: https://gitlab.com/ , The trailing slash is mandatory.
  * **instanceRole** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  IAM role for the Gitlab Runner Instance . __*Default*__: new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .
  * **instanceType** (<code>string</code>)  Runner default EC2 instance type. __*Default*__: t3.micro
  * **maxCapacity** (<code>number</code>)  Maximum capacity limit for autoscaling group. __*Default*__: desiredCapacity
  * **minCapacity** (<code>number</code>)  Minimum capacity limit for autoscaling group. __*Default*__: minCapacity: 1
  * **spotInstance** (<code>boolean</code>)  Run worker nodes as EC2 Spot. __*Default*__: false
  * **tags** (<code>Array<string></code>)  tags for the runner. __*Default*__: ['runner', 'gitlab', 'awscdk']
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  VPC for the Gitlab Runner . __*Default*__: A new VPC will be created.
  * **vpcSubnet** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  VPC subnet. __*Default*__: private subnet



### Properties


Name | Type | Description 
-----|------|-------------
**autoscalingGroup**🔹 | <code>[AutoScalingGroup](#aws-cdk-aws-autoscaling-autoscalinggroup)</code> | This represents a Runner Auto Scaling Group.
**instanceRole**🔹 | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | The IAM role assumed by the Runner instance.
**securityGroup**🔹 | <code>[ISecurityGroup](#aws-cdk-aws-ec2-isecuritygroup)</code> | The EC2 runner's default SecurityGroup.
**topicAlarm**🔹 | <code>[ITopic](#aws-cdk-aws-sns-itopic)</code> | The SNS topic to suscribe alarms for EC2 runner's metrics.
**vpc**🔹 | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The EC2 runner's VPC.

### Methods


#### createUserData(props)🔹 <a id="cdk-gitlab-runner-gitlabrunnerautoscaling-createuserdata"></a>



```ts
createUserData(props: GitlabRunnerAutoscalingProps): Array<string>
```

* **props** (<code>[GitlabRunnerAutoscalingProps](#cdk-gitlab-runner-gitlabrunnerautoscalingprops)</code>)  *No description*
  * **gitlabToken** (<code>string</code>)  Gitlab token. 
  * **alarms** (<code>Array<json></code>)  Parameters of put_metric_alarm function. __*Default*__: [{ AlarmName: 'GitlabRunnerDiskUsage', MetricName: 'disk_used_percent', }]
  * **desiredCapacity** (<code>number</code>)  Desired capacity limit for autoscaling group. __*Default*__: minCapacity, and leave unchanged during deployment
  * **dockerVolumes** (<code>Array<[DockerVolumes](#cdk-gitlab-runner-dockervolumes)></code>)  add another Gitlab Container Runner Docker Volumes Path at job runner runtime. __*Default*__: already mount "/var/run/docker.sock:/var/run/docker.sock"
  * **ebsSize** (<code>number</code>)  Gitlab Runner instance EBS size . __*Default*__: ebsSize=60
  * **gitlabRunnerImage** (<code>string</code>)  Image URL of Gitlab Runner. __*Default*__: public.ecr.aws/gitlab/gitlab-runner:alpine
  * **gitlabUrl** (<code>string</code>)  Gitlab Runner register url . __*Default*__: https://gitlab.com/ , The trailing slash is mandatory.
  * **instanceRole** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  IAM role for the Gitlab Runner Instance . __*Default*__: new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .
  * **instanceType** (<code>string</code>)  Runner default EC2 instance type. __*Default*__: t3.micro
  * **maxCapacity** (<code>number</code>)  Maximum capacity limit for autoscaling group. __*Default*__: desiredCapacity
  * **minCapacity** (<code>number</code>)  Minimum capacity limit for autoscaling group. __*Default*__: minCapacity: 1
  * **spotInstance** (<code>boolean</code>)  Run worker nodes as EC2 Spot. __*Default*__: false
  * **tags** (<code>Array<string></code>)  tags for the runner. __*Default*__: ['runner', 'gitlab', 'awscdk']
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  VPC for the Gitlab Runner . __*Default*__: A new VPC will be created.
  * **vpcSubnet** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  VPC subnet. __*Default*__: private subnet

__Returns__:
* <code>Array<string></code>



## struct DockerVolumes 🔹 <a id="cdk-gitlab-runner-dockervolumes"></a>


Docker Volumes interface.



Name | Type | Description 
-----|------|-------------
**containerPath**🔹 | <code>string</code> | Job Runtime Container Path Host Path.
**hostPath**🔹 | <code>string</code> | EC2 Runner Host Path.



## struct GitlabContainerRunnerProps 🔹 <a id="cdk-gitlab-runner-gitlabcontainerrunnerprops"></a>


GitlabContainerRunner Props.



Name | Type | Description 
-----|------|-------------
**gitlabtoken**🔹 | <code>string</code> | Gitlab token for the Register Runner .
**blockDuration**?🔹 | <code>[BlockDuration](#cdk-gitlab-runner-blockduration)</code> | Reservce the Spot Runner instance as spot block with defined duration.<br/>__*Default*__: BlockDuration.ONE_HOUR , !!! only support spotfleet runner !!! .
**dockerVolumes**?🔹 | <code>Array<[DockerVolumes](#cdk-gitlab-runner-dockervolumes)></code> | add another Gitlab Container Runner Docker Volumes Path at job runner runtime.<br/>__*Default*__: already mount "/var/run/docker.sock:/var/run/docker.sock"
**ebsSize**?🔹 | <code>number</code> | Gitlab Runner instance EBS size .<br/>__*Default*__: ebsSize=60
**ec2iamrole**?🔹 | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | IAM role for the Gitlab Runner Instance .<br/>__*Default*__: new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .
**ec2type**?🔹 | <code>string</code> | Runner default EC2 instance type.<br/>__*Default*__: t3.micro
**gitlabRunnerImage**?🔹 | <code>string</code> | Image URL of Gitlab Runner.<br/>__*Default*__: public.ecr.aws/gitlab/gitlab-runner:alpine
**gitlaburl**?🔹 | <code>string</code> | Gitlab Runner register url .<br/>__*Default*__: gitlaburl='https://gitlab.com/' , please use https://yourgitlab.com/ do not use https://yourgitlab.com
**instanceInterruptionBehavior**?🔹 | <code>[InstanceInterruptionBehavior](#cdk-gitlab-runner-instanceinterruptionbehavior)</code> | The behavior when a Spot Runner Instance is interrupted.<br/>__*Default*__: InstanceInterruptionBehavior.TERMINATE , !!! only support spotfleet runner !!! .
**keyName**?🔹 | <code>string</code> | SSH key name.<br/>__*Default*__: no ssh key will be assigned , !!! only support spotfleet runner !!! .
**selfvpc**?🔹 | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | VPC for the Gitlab Runner .<br/>__*Default*__: new VPC will be created , 1 Vpc , 2 Public Subnet .
**spotFleet**?🔹 | <code>boolean</code> | Gitlab Runner instance Use Spot Fleet or not ?!.<br/>__*Default*__: spotFleet=false
**tag1**?⚠️ | <code>string</code> | Gitlab Runner register tag1  .<br/>__*Default*__: tag1: gitlab .
**tag2**?⚠️ | <code>string</code> | Gitlab Runner register tag2  .<br/>__*Default*__: tag2: awscdk .
**tag3**?⚠️ | <code>string</code> | Gitlab Runner register tag3  .<br/>__*Default*__: tag3: runner .
**tags**?🔹 | <code>Array<string></code> | tags for the runner.<br/>__*Default*__: ['runner', 'gitlab', 'awscdk']
**validUntil**?🔹 | <code>string</code> | the time when the spot fleet allocation expires.<br/>__*Default*__: no expiration , !!! only support spotfleet runner !!! .
**vpcSubnet**?🔹 | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | VPC subnet for the spot fleet.<br/>__*Default*__: public subnet



## struct GitlabRunnerAutoscalingProps 🔹 <a id="cdk-gitlab-runner-gitlabrunnerautoscalingprops"></a>


GitlabRunnerAutoscaling Props.



Name | Type | Description 
-----|------|-------------
**gitlabToken**🔹 | <code>string</code> | Gitlab token.
**alarms**?🔹 | <code>Array<json></code> | Parameters of put_metric_alarm function.<br/>__*Default*__: [{ AlarmName: 'GitlabRunnerDiskUsage', MetricName: 'disk_used_percent', }]
**desiredCapacity**?🔹 | <code>number</code> | Desired capacity limit for autoscaling group.<br/>__*Default*__: minCapacity, and leave unchanged during deployment
**dockerVolumes**?🔹 | <code>Array<[DockerVolumes](#cdk-gitlab-runner-dockervolumes)></code> | add another Gitlab Container Runner Docker Volumes Path at job runner runtime.<br/>__*Default*__: already mount "/var/run/docker.sock:/var/run/docker.sock"
**ebsSize**?🔹 | <code>number</code> | Gitlab Runner instance EBS size .<br/>__*Default*__: ebsSize=60
**gitlabRunnerImage**?🔹 | <code>string</code> | Image URL of Gitlab Runner.<br/>__*Default*__: public.ecr.aws/gitlab/gitlab-runner:alpine
**gitlabUrl**?🔹 | <code>string</code> | Gitlab Runner register url .<br/>__*Default*__: https://gitlab.com/ , The trailing slash is mandatory.
**instanceRole**?🔹 | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | IAM role for the Gitlab Runner Instance .<br/>__*Default*__: new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .
**instanceType**?🔹 | <code>string</code> | Runner default EC2 instance type.<br/>__*Default*__: t3.micro
**maxCapacity**?🔹 | <code>number</code> | Maximum capacity limit for autoscaling group.<br/>__*Default*__: desiredCapacity
**minCapacity**?🔹 | <code>number</code> | Minimum capacity limit for autoscaling group.<br/>__*Default*__: minCapacity: 1
**spotInstance**?🔹 | <code>boolean</code> | Run worker nodes as EC2 Spot.<br/>__*Default*__: false
**tags**?🔹 | <code>Array<string></code> | tags for the runner.<br/>__*Default*__: ['runner', 'gitlab', 'awscdk']
**vpc**?🔹 | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | VPC for the Gitlab Runner .<br/>__*Default*__: A new VPC will be created.
**vpcSubnet**?🔹 | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | VPC subnet.<br/>__*Default*__: private subnet



## enum BlockDuration 🔹 <a id="cdk-gitlab-runner-blockduration"></a>

BlockDuration enum.

Name | Description
-----|-----
**ONE_HOUR** 🔹|one hours.
**TWO_HOURS** 🔹|two hours.
**THREE_HOURS** 🔹|three hours.
**FOUR_HOURS** 🔹|four hours.
**FIVE_HOURS** 🔹|five hours.
**SIX_HOURS** 🔹|six hours.
**SEVEN_HOURS** 🔹|seven hours.
**EIGHT_HOURS** 🔹|eight hours.
**NINE_HOURS** 🔹|nine hours.
**TEN_HOURS** 🔹|ten hours.
**ELEVEN_HOURS** 🔹|eleven hours.
**TWELVE_HOURS** 🔹|twelve hours.
**THIRTEEN_HOURS** 🔹|thirteen hours.
**FOURTEEN_HOURS** 🔹|fourteen hours.
**FIFTEEN_HOURS** 🔹|fifteen hours.
**SIXTEEN_HOURS** 🔹|sixteen hours.
**SEVENTEEN_HOURS** 🔹|seventeen hours.
**EIGHTTEEN_HOURS** 🔹|eightteen hours.
**NINETEEN_HOURS** 🔹|nineteen hours.
**TWENTY_HOURS** 🔹|twenty hours.


## enum InstanceInterruptionBehavior 🔹 <a id="cdk-gitlab-runner-instanceinterruptionbehavior"></a>

InstanceInterruptionBehavior enum.

Name | Description
-----|-----
**HIBERNATE** 🔹|hibernate.
**STOP** 🔹|stop.
**TERMINATE** 🔹|terminate.


