[![NPM version](https://badge.fury.io/js/cdk-gitlab-runner.svg)](https://badge.fury.io/js/cdk-gitlab-runner)
[![PyPI version](https://badge.fury.io/py/cdk-gitlab-runner.svg)](https://badge.fury.io/py/cdk-gitlab-runner)
![Release](https://github.com/guan840912/cdk-gitlab-runner/workflows/Release/badge.svg)

![Downloads](https://img.shields.io/badge/-DOWNLOADS:-brightgreen?color=gray)
![npm](https://img.shields.io/npm/dt/cdk-gitlab-runner?label=npm&color=orange)
![PyPI](https://img.shields.io/pypi/dm/cdk-gitlab-runner?label=pypi&color=blue)

![](https://img.shields.io/badge/iam_role_self-enable-green=?style=plastic&logo=appveyor)
![](https://img.shields.io/badge/vpc_self-enable-green=?style=plastic&logo=appveyor)
![](https://img.shields.io/badge/gitlab_url-customize-green=?style=plastic&logo=appveyor)
![](https://img.shields.io/badge/spotfleet-runner-green=?style=plastic&logo=appveyor)

# Welcome to `cdk-gitlab-runner`

This repository template helps you create gitlab runner on your aws account via AWS CDK one line.

## Note

### Default will help you generate below services:

- VPC
  - Public Subnet (2)
- EC2 (1 T3.micro)

## Before start you need gitlab runner token in your `gitlab project` or `gitlab group`

### In Group

Group > Settings > CI/CD
![group](image/group_runner_page.png)

### In Group

Project > Settings > CI/CD > Runners
![project](image/project_runner_page.png)

## Usage

Replace your gitlab runner token in `$GITLABTOKEN`

### Instance Type

```typescript
import { GitlabContainerRunner } from 'cdk-gitlab-runner';

// If want change instance type to t3.large .
new GitlabContainerRunner(this, 'runner-instance', { gitlabtoken: '$GITLABTOKEN', ec2type:'t3.large' });
// OR
// Just create a gitlab runner , by default instance type is t3.micro .
import { GitlabContainerRunner } from 'cdk-gitlab-runner';

new GitlabContainerRunner(this, 'runner-instance', { gitlabtoken: '$GITLABTOKEN' });})
```

### Gitlab Server Customize Url .

If you want change what you want tag name .

```typescript
// If you want change  what  your self Gitlab Server Url .
import { GitlabContainerRunner } from 'cdk-gitlab-runner';

new GitlabContainerRunner(this, 'runner-instance-change-tag', {
  gitlabtoken: '$GITLABTOKEN',
  gitlaburl: 'https://gitlab.my.com/',
});
```

### Tags

If you want change what you want tag name .

```typescript
// If you want change  what  you want tag name .
import { GitlabContainerRunner } from 'cdk-gitlab-runner';

new GitlabContainerRunner(this, 'runner-instance-change-tag', {
  gitlabtoken: '$GITLABTOKEN',
  tags: ['aa', 'bb', 'cc'],
});
```

### IAM Policy

If you want add runner other IAM Policy like s3-readonly-access.

```typescript
// If you want add runner other IAM Policy like s3-readonly-access.
import { GitlabContainerRunner } from 'cdk-gitlab-runner';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

const runner = new GitlabContainerRunner(this, 'runner-instance-add-policy', {
  gitlabtoken: '$GITLABTOKEN',
  tags: ['aa', 'bb', 'cc'],
});
runner.runnerRole.addManagedPolicy(
  ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
);
```

### Security Group

If you want add runner other SG Ingress .

```typescript
// If you want add runner other SG Ingress .
import { GitlabContainerRunner } from 'cdk-gitlab-runner';
import { Port, Peer } from '@aws-cdk/aws-ec2';

const runner = new GitlabContainerRunner(this, 'runner-add-SG-ingress', {
  gitlabtoken: 'GITLABTOKEN',
  tags: ['aa', 'bb', 'cc'],
});

// you can add ingress in your runner SG .
runner.defaultRunnerSG.connections.allowFrom(
  Peer.ipv4('0.0.0.0/0'),
  Port.tcp(80),
);
```

### Use self VPC

> 2020/06/27 , you can use your self exist VPC or new VPC , but please check your `vpc public Subnet` Auto-assign public IPv4 address must be Yes ,or `vpc private Subnet` route table associated `nat gateway` .

```typescript
import { GitlabContainerRunner } from 'cdk-gitlab-runner';
import { Port, Peer, Vpc, SubnetType } from '@aws-cdk/aws-ec2';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

const newvpc = new Vpc(stack, 'VPC', {
  cidr: '10.1.0.0/16',
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

const runner = new GitlabContainerRunner(this, 'testing', {
  gitlabtoken: '$GITLABTOKEN',
  ec2type: 't3.small',
  selfvpc: newvpc,
});
```

### Use your self exist role

> 2020/06/27 , you can use your self exist role assign to runner

```typescript
import { GitlabContainerRunner } from 'cdk-gitlab-runner';
import { Port, Peer } from '@aws-cdk/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam';

const role = new Role(this, 'runner-role', {
  assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
  description: 'For Gitlab EC2 Runner Test Role',
  roleName: 'TestRole',
});

const runner = new GitlabContainerRunner(stack, 'testing', {
  gitlabtoken: '$GITLAB_TOKEN',
  ec2iamrole: role,
});
runner.runnerRole.addManagedPolicy(
  ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
);
```

### Custom Gitlab Runner EBS szie

> 2020/08/22 , you can change you want ebs size.

```typescript
import { GitlabContainerRunner } from 'cdk-gitlab-runner';

new GitlabContainerRunner(stack, 'testing', {
  gitlabtoken: '$GITLAB_TOKEN',
  ebsSize: 50,
});
```

### Control the number of runners with AutoScalingGroup

> 2020/11/25 , you can set the number of runners.

```typescript
import { GitlabRunnerAutoscaling } from 'cdk-gitlab-runner';

new GitlabRunnerAutoscaling(stack, 'testing', {
  gitlabToken: '$GITLAB_TOKEN',
  minCapacity: 2,
  maxCapacity: 2,
});
```

### Support Spotfleet Gitlab Runner

> 2020/08/27 , you can use spotfleet instance be your gitlab runner,
> after create spotfleet instance will auto output instance id .thank [@pahud](https://github.com/pahud/cdk-spot-one) again ~~~

```typescript
import { GitlabContainerRunner, BlockDuration } from 'cdk-gitlab-runner';

const runner = new GitlabContainerRunner(stack, 'testing', {
  gitlabtoken: 'GITLAB_TOKEN',
  ec2type: 't3.large',
  blockDuration: BlockDuration.ONE_HOUR,
  spotFleet: true,
});
// configure the expiration after 1 hours
runner.expireAfter(Duration.hours(1));
```

> 2020/11/19, you setting job runtime bind host volumes.
> see more https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section

```typescript
import { GitlabContainerRunner, BlockDuration } from 'cdk-gitlab-runner';

const runner = new GitlabContainerRunner(stack, 'testing', {
  gitlabtoken: 'GITLAB_TOKEN',
  ec2type: 't3.large',
  dockerVolumes: [
    {
      hostPath: '/tmp/cahce',
      containerPath: '/tmp/cahce',
    },
  ],
});
```
> 2020/11/19, support runner auto unregister runner when cdk app destroy.

# Note

![](https://img.shields.io/badge/version-1.47.1-green=?style=plastic&logo=appveyor) vs ![](https://img.shields.io/badge/version-1.49.1-green=?style=plastic&logo=appveyor)

> About change instance type

This is before ![](https://img.shields.io/badge/version-1.47.1-green=?style) ( included ![](https://img.shields.io/badge/version-1.47.1-green=?style) )

```typescript
import { InstanceType, InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';
import { GitlabContainerRunner } from 'cdk-gitlab-runner';

// If want change instance type to t3.large .
new GitlabContainerRunner(this, 'runner-instance', {
  gitlabtoken: '$GITLABTOKEN',
  ec2type: InstanceType.of(InstanceClass.T3, InstanceSize.LARGE),
});
```

This is ![](https://img.shields.io/badge/version-1.49.1-green=?style)

```typescript
import { GitlabContainerRunner } from 'cdk-gitlab-runner';

// If want change instance type to t3.large .
new GitlabContainerRunner(this, 'runner-instance', {
  gitlabtoken: '$GITLABTOKEN',
  ec2type: 't3.large',
});
```

## Wait about 6 mins , If success you will see your runner in that page .

![runner](image/group_runner2.png)

#### you can use tag `gitlab` , `runner` , `awscdk` ,

## Example _`gitlab-ci.yaml`_

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

## AWS Systems Manager > Session Manager > Start a session

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


## :clap:  Supporters
[![Stargazers repo roster for @guan840912/cdk-gitlab-runner](https://reporoster.com/stars/guan840912/cdk-gitlab-runner)](https://github.com/guan840912/cdk-gitlab-runner/stargazers)
