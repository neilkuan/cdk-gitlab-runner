const { ConstructLibraryAws } = require('projen');

const PROJECT_NAME = 'cdk-gitlab-runner';
const PROJECT_DESCRIPTION = 'A Gitlab Runner JSII construct lib for AWS CDK';

const project = new ConstructLibraryAws({
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  repository: 'https://github.com/guan840912/cdk-gitlab-runner.git',
  authorName: 'Neil Kuan',
  authorEmail: 'guan840912@gmail.com',
  keywords: ['aws', 'gitlab', 'runner'],
  catalog: {
    twitter: 'neil_kuan',
    announce: true,
  },
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  cdkVersion: '1.62.0',
  cdkDependencies: [
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-logs',
    '@aws-cdk/core',
    '@aws-cdk/custom-resources',
  ],
  python: {
    distName: 'cdk-gitlab-runner',
    module: 'cdk_gitlab_runner',
  },
});


project.gitignore.exclude('cdk.context.json', 'cdk.out');

project.npmignore.exclude(
  'cdk.context.json',
  'cdk.out',
  'coverage',
  'yarn-error.log',
  'image',
);
project.synth();
