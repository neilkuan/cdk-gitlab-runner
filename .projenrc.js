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
  projenUpgradeSecret: 'AUTOMATION_GITHUB_TOKEN',
  stability: 'experimental',
  autoReleaseSchedule: 'never',
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  cdkVersion: '1.66.0',
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

project.mergify.addRule({
  name: 'Merge approved pull requests with auto-merge label if CI passes',
  conditions: [
    '#approved-reviews-by>=1',
    'status-success=build',
    'label=auto-merge',
    'label!=do-not-merge',
    'label!=work-in-progress',
  ],
  actions: {
    merge: {
      method: 'merge',
      commit_message: 'title+body',
    },
  },
});

const common_exclude = ['cdk.out', 'cdk.context.json', 'image', 'yarn-error.log','coverage'];
project.gitignore.exclude(...common_exclude);

project.npmignore.exclude(...common_exclude);
project.synth();
