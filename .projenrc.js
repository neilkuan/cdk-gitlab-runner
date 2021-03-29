const { AwsCdkConstructLibrary } = require('projen');
const { Automation } = require('projen-automate-it');

const PROJECT_NAME = 'cdk-gitlab-runner';
const PROJECT_DESCRIPTION = 'A Gitlab Runner JSII construct lib for AWS CDK';
const AUTOMATION_TOKEN = 'AUTOMATION_GITHUB_TOKEN';

const project = new AwsCdkConstructLibrary({
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  repository: 'https://github.com/guan840912/cdk-gitlab-runner.git',
  authorName: 'Neil Kuan',
  authorEmail: 'guan840912@gmail.com',
  keywords: ['aws', 'gitlab', 'runner'],
  dependabot: false,
  defaultReleaseBranch: 'master',
  catalog: {
    twitter: 'neil_kuan',
    announce: true,
  },
  compat: true,
  stability: 'experimental',
  cdkVersion: '1.95.1',
  cdkDependencies: [
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-autoscaling',
    '@aws-cdk/aws-autoscaling-hooktargets',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-s3-assets',
    '@aws-cdk/core',
    '@aws-cdk/aws-sns',
    '@aws-cdk/aws-sns-subscriptions',
    '@aws-cdk/custom-resources',
  ],
  devDeps: [
    'xmldom',
    'projen-automate-it',
  ],
  bundledDeps: ['projen-automate-it'],
  python: {
    distName: 'cdk-gitlab-runner',
    module: 'cdk_gitlab_runner',
  },
});

const automation = new Automation(project, {
  automationToken: AUTOMATION_TOKEN,
});
automation.autoApprove();
automation.autoMerge();
automation.projenYarnUpgrade();

const common_exclude = ['cdk.out', 'cdk.context.json', 'yarn-error.log', 'coverage', 'venv'];
project.gitignore.exclude(...common_exclude);

project.npmignore.exclude(...common_exclude, 'image');
project.synth();
