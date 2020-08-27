const { JsiiProject, Semver } = require('projen');

const AWS_CDK_LATEST_RELEASE = '1.60.0';
const PROJECT_NAME = 'cdk-gitlab-runner';
const PROJECT_DESCRIPTION = 'A Gitlab Runner JSII construct lib for AWS CDK';

const project = new JsiiProject({
  name: PROJECT_NAME,
  jsiiVersion: Semver.caret('1.5.0'),
  description: PROJECT_DESCRIPTION,
  repository: 'https://github.com/guan840912/cdk-gitlab-runner.git',
  authorName: 'Neil Kuan',
  authorEmail: 'guan840912@gmail.com',
  stability: 'experimental',
  devDependencies: {
    '@aws-cdk/assert': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@types/jest': Semver.caret('25.2.3'),
    '@types/node': Semver.caret('14.0.11'),
    'dot-prop': Semver.caret('5.1.1'),
  },
  peerDependencies: {
    constructs: Semver.pinned('3.0.4'),
    '@aws-cdk/core': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-iam': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-ec2': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-lambda': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-logs': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/custom-resources': Semver.pinned(AWS_CDK_LATEST_RELEASE),
  },
  dependencies: {
    constructs: Semver.pinned('3.0.4'),
    '@aws-cdk/core': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-iam': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-ec2': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-lambda': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/aws-logs': Semver.pinned(AWS_CDK_LATEST_RELEASE),
    '@aws-cdk/custom-resources': Semver.pinned(AWS_CDK_LATEST_RELEASE),
  },
  python: {
    distName: 'cdk-gitlab-runner',
    module: 'cdk_gitlab_runner',
  },
});

project.addFields({
  keywords: ['cdk', 'spot', 'aws'],
});

project.gitignore.exclude('cdk.context.json', 'cdk.out');

project.npmignore.exclude(
  'cdk.context.json',
  'cdk.out',
  'coverage',
  'yarn-error.log',
);
project.addDevDependencies({
  'jsii-docgen': Semver.pinned('1.4.0'),
});

project.addFields({
  keywords: ['aws', 'gitlab', 'runner'],
});

project.synth();
