# API Reference

**Classes**

Name|Description
----|-----------
[GitlabContainerRunner](#cdk-gitlab-runner-gitlabcontainerrunner)|*No description*


**Structs**

Name|Description
----|-----------
[GitlabContainerRunnerProps](#cdk-gitlab-runner-gitlabcontainerrunnerprops)|*No description*


**Enums**

Name|Description
----|-----------
[BlockDuration](#cdk-gitlab-runner-blockduration)|*No description*
[InstanceInterruptionBehavior](#cdk-gitlab-runner-instanceinterruptionbehavior)|*No description*



## class GitlabContainerRunner  <a id="cdk-gitlab-runner-gitlabcontainerrunner"></a>



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
  * **ebsSize** (<code>number</code>)  Gitlab Runner instance EBS size . __*Default*__: ebsSize=60
  * **ec2iamrole** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  IAM role for the Gitlab Runner Instance . __*Default*__: new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .
  * **ec2type** (<code>string</code>)  Runner default EC2 instance type. __*Default*__: t3.micro
  * **gitlaburl** (<code>string</code>)  Gitlab Runner register url . __*Default*__: gitlaburl='https://gitlab.com/'
  * **instanceInterruptionBehavior** (<code>[InstanceInterruptionBehavior](#cdk-gitlab-runner-instanceinterruptionbehavior)</code>)  The behavior when a Spot Runner Instance is interrupted. __*Default*__: InstanceInterruptionBehavior.TERMINATE , !!! only support spotfleet runner !!! .
  * **keyName** (<code>string</code>)  SSH key name. __*Default*__: no ssh key will be assigned , !!! only support spotfleet runner !!! .
  * **selfvpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  VPC for the Gitlab Runner . __*Default*__: new VPC will be created , 1 Vpc , 2 Public Subnet .
  * **spotFleet** (<code>boolean</code>)  Gitlab Runner instance Use Spot Fleet or not ?!. __*Default*__: spotFleet=false
  * **tag1** (<code>string</code>)  Gitlab Runner register tag1  . __*Default*__: tag1: gitlab .
  * **tag2** (<code>string</code>)  Gitlab Runner register tag2  . __*Default*__: tag2: awscdk .
  * **tag3** (<code>string</code>)  Gitlab Runner register tag3  . __*Default*__: tag3: runner .
  * **validUntil** (<code>string</code>)  the time when the spot fleet allocation expires. __*Default*__: no expiration , !!! only support spotfleet runner !!! .
  * **vpcSubnet** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  VPC subnet for the spot fleet. __*Default*__: public subnet



### Properties


Name | Type | Description 
-----|------|-------------
**defaultRunnerSG** | <code>[ISecurityGroup](#aws-cdk-aws-ec2-isecuritygroup)</code> | <span></span>
**runnerEc2** | <code>[IInstance](#aws-cdk-aws-ec2-iinstance)</code> | This represents a Runner EC2 instance , !!! only support On-demand runner instance !!! .
**runnerRole** | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | The IAM role assumed by the Runner instance .
**spotFleetInstanceId** | <code>string</code> | the first instance id in this fleet , !!! only support spotfleet runner !!! .
**spotFleetRequestId** | <code>string</code> | SpotFleetRequestId for this spot fleet , !!! only support spotfleet runner !!! .
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | <span></span>

### Methods


#### expireAfter(duration) <a id="cdk-gitlab-runner-gitlabcontainerrunner-expireafter"></a>



```ts
expireAfter(duration: Duration): void
```

* **duration** (<code>[Duration](#aws-cdk-core-duration)</code>)  *No description*






## struct GitlabContainerRunnerProps  <a id="cdk-gitlab-runner-gitlabcontainerrunnerprops"></a>






Name | Type | Description 
-----|------|-------------
**gitlabtoken** | <code>string</code> | Gitlab token for the Register Runner .
**blockDuration**? | <code>[BlockDuration](#cdk-gitlab-runner-blockduration)</code> | Reservce the Spot Runner instance as spot block with defined duration.<br/>__*Default*__: BlockDuration.ONE_HOUR , !!! only support spotfleet runner !!! .
**ebsSize**? | <code>number</code> | Gitlab Runner instance EBS size .<br/>__*Default*__: ebsSize=60
**ec2iamrole**? | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | IAM role for the Gitlab Runner Instance .<br/>__*Default*__: new Role for Gitlab Runner Instance , attach AmazonSSMManagedInstanceCore Policy .
**ec2type**? | <code>string</code> | Runner default EC2 instance type.<br/>__*Default*__: t3.micro
**gitlaburl**? | <code>string</code> | Gitlab Runner register url .<br/>__*Default*__: gitlaburl='https://gitlab.com/'
**instanceInterruptionBehavior**? | <code>[InstanceInterruptionBehavior](#cdk-gitlab-runner-instanceinterruptionbehavior)</code> | The behavior when a Spot Runner Instance is interrupted.<br/>__*Default*__: InstanceInterruptionBehavior.TERMINATE , !!! only support spotfleet runner !!! .
**keyName**? | <code>string</code> | SSH key name.<br/>__*Default*__: no ssh key will be assigned , !!! only support spotfleet runner !!! .
**selfvpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | VPC for the Gitlab Runner .<br/>__*Default*__: new VPC will be created , 1 Vpc , 2 Public Subnet .
**spotFleet**? | <code>boolean</code> | Gitlab Runner instance Use Spot Fleet or not ?!.<br/>__*Default*__: spotFleet=false
**tag1**? | <code>string</code> | Gitlab Runner register tag1  .<br/>__*Default*__: tag1: gitlab .
**tag2**? | <code>string</code> | Gitlab Runner register tag2  .<br/>__*Default*__: tag2: awscdk .
**tag3**? | <code>string</code> | Gitlab Runner register tag3  .<br/>__*Default*__: tag3: runner .
**validUntil**? | <code>string</code> | the time when the spot fleet allocation expires.<br/>__*Default*__: no expiration , !!! only support spotfleet runner !!! .
**vpcSubnet**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | VPC subnet for the spot fleet.<br/>__*Default*__: public subnet



## enum BlockDuration  <a id="cdk-gitlab-runner-blockduration"></a>



Name | Description
-----|-----
**ONE_HOUR** |
**TWO_HOURS** |
**THREE_HOURS** |
**FOUR_HOURS** |
**FIVE_HOURS** |
**SIX_HOURS** |
**SEVEN_HOURS** |
**EIGHT_HOURS** |
**NINE_HOURS** |
**TEN_HOURS** |
**ELEVEN_HOURS** |
**TWELVE_HOURS** |
**THIRTEEN_HOURS** |
**FOURTEEN_HOURS** |
**FIFTEEN_HOURS** |
**SIXTEEN_HOURS** |
**SEVENTEEN_HOURS** |
**EIGHTTEEN_HOURS** |
**NINETEEN_HOURS** |
**TWENTY_HOURS** |


## enum InstanceInterruptionBehavior  <a id="cdk-gitlab-runner-instanceinterruptionbehavior"></a>



Name | Description
-----|-----
**HIBERNATE** |
**STOP** |
**TERMINATE** |


