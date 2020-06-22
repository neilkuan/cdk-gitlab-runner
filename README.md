[![NPM version](https://badge.fury.io/js/cdk-gitlab-runner.svg)](https://badge.fury.io/js/cdk-gitlab-runner)
[![PyPI version](https://badge.fury.io/py/cdk-gitlab-runner.svg)](https://badge.fury.io/py/cdk-gitlab-runner)
![Release](https://github.com/guan840912/cdk-gitlab-runner/workflows/Release/badge.svg)
# Welcome to `cdk-gitlab-runner`

This repository template helps you create gitlab runner on your aws account via AWS CDK one line.

## Note 
### Default will help you generate below services:
- VPC
  - Public Subnet (2)
- EC2 (1 T3.large)

## Before start you need gitlab runner token in your  `gitlab project` or   `gitlab group`

###  In Group
Group > Settings > CI/CD 
![group](image/group_runner_page.png)

###  In Group
Project > Settings > CI/CD > Runners 
![project](image/project_runner_page.png)

## Usage
Replace your gitlab runner token in `$GITLABTOKEN`
```typescript
import { GitlabContainerRunner } from 'cdk-gitlab-runner';
import { InstanceType, InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

// If want change instance type to t3.large .
new GitlabContainerRunner(stack, 'testing', { gitlabtoken: '$GITLABTOKEN', ec2type: InstanceType.of(InstanceClass.T2, InstanceSize.LARGE) });
// OR
// Just create a gitlab runner , by default instance type is t3.small .
import { GitlabContainerRunner } from 'cdk-gitlab-runner';
import { InstanceType, InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

new GitlabContainerRunner(stack, 'testing', { gitlabtoken: '$GITLABTOKEN' });})

// If want change tags you want.
import { GitlabContainerRunner } from 'cdk-gitlab-runner';
import { InstanceType, InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

new GitlabContainerRunner(stack, 'testing-have-type-tag', { gitlabtoken: 'GITLABTOKEN', tag1: 'aa', tag2: 'bb', tag3: 'cc' });

// If you want add runner other IAM Policy like s3-readonly-access.
import { GitlabContainerRunner } from 'cdk-gitlab-runner';
import { InstanceType, InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

const runner =  new GitlabContainerRunner(stack, 'testing-have-type-tag', { gitlabtoken: 'GITLABTOKEN', tag1: 'aa', tag2: 'bb', tag3: 'cc' });
runner.runnerRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'));

// If you want add runner other SG Ingress .
import { GitlabContainerRunner } from 'cdk-gitlab-runner';
import { InstanceType, InstanceClass, InstanceSize, Port, Peer } from '@aws-cdk/aws-ec2';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

const runner =  new GitlabContainerRunner(stack, 'testing-have-type-tag', { gitlabtoken: 'GITLABTOKEN', tag1: 'aa', tag2: 'bb', tag3: 'cc' });
runner.runnerRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'));
# you can add ingress in your runner SG .
runner.runneEc2.connections.allowFrom(Peer.ipv4('0.0.0.0/0'), Port.tcp(80));
```

```python
# Example python instance type change to t3.small . 
from aws_cdk import (
  core,
  aws_iam as iam,
)
from cdk_gitlab_runner import GitlabContainerRunner
from aws_cdk.aws_ec2 import InstanceType, InstanceClass, InstanceSize, Peer, Port
runner = GitlabContainerRunner(self, 'gitlab-runner', gitlabtoken='$GITLABTOKEN',
                              ec2type=InstanceType.of(
                                  instance_class=InstanceClass.BURSTABLE3, instance_size=InstanceSize.SMALL), tag1='aa',tag2='bb',tag3='cc')

runner.runnerRole.add_managed_policy(iam.ManagedPolicy.from_aws_managed_policy_name("AmazonS3ReadOnlyAccess"))
runner.runneEc2.connections.allow_from(Peer.ipv4('0.0.0.0/0'), Port.tcp(80));
```
### see more instance class and size
[InstanceClass](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-ec2.InstanceClass.html)

[InstanceSize](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-ec2.InstanceSize.html)

## Wait about 6 mins , If success you will see your runner in that page .
![runner](image/group_runner2.png)

#### you can use tag `gitlab` , `runner` , `awscdk`  , 
## Example     _`gitlab-ci.yaml`_  
[gitlab docs see more ...](https://docs.gitlab.com/ee/ci/yaml/README.html)
```yaml
dockerjob:
  image: docker:18.09-dind
  variables:
  tags:
    - runner
    - awscdk
    - gitlab
  variables:
    DOCKER_TLS_CERTDIR: ""
  before_script:
    - docker info
  script:
    - docker info;
    - echo 'test 123';
    - echo 'hello world 1228'
```





### If your want to debug you can go to aws console 
# `In your runner region !!!`
## AWS Systems Manager  >  Session Manager  >  Start a session
![system manager](image/session.png)
#### click your `runner` and click `start session`
#### in the brower console in put `bash` 
```bash
# become to root 
sudo -i 

# list runner container .
root# docker ps -a

# modify gitlab-runner/config.toml

root# cd /home/ec2-user/.gitlab-runner/ && ls 
config.toml

```