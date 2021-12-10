const { awscdk } = require('projen');

const PROJECT_NAME = 'cdk-gitlab-runner';
const PROJECT_DESCRIPTION = 'Use AWS CDK to create a gitlab runner, and use gitlab runner to help you execute your Gitlab pipeline job.';

const project = new awscdk.AwsCdkConstructLibrary({
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  repository: 'https://github.com/neilkuan/cdk-gitlab-runner.git',
  authorName: 'Neil Kuan',
  authorEmail: 'guan840912@gmail.com',
  keywords: ['aws', 'gitlab', 'runner'],
  defaultReleaseBranch: 'master',
  catalog: {
    twitter: 'neil_kuan',
    announce: false,
  },
  compat: true,
  stability: 'experimental',
  cdkVersion: '2.1.0',
  /**
   * we default release the main branch(cdkv2) with major version 2.
   */
  majorVersion: 2,
  defaultReleaseBranch: 'master',
  /**
    * we also release the cdkv1 branch with major version 1.
    */
  releaseBranches: {
    cdkv1: { npmDistTag: 'cdkv1', majorVersion: 1 },
  },
  // cdkDependencies: [
  //   '@aws-cdk/aws-iam',
  //   '@aws-cdk/aws-ec2',
  //   '@aws-cdk/aws-autoscaling',
  //   '@aws-cdk/aws-autoscaling-hooktargets',
  //   '@aws-cdk/aws-lambda',
  //   '@aws-cdk/aws-logs',
  //   '@aws-cdk/aws-s3',
  //   '@aws-cdk/aws-s3-assets',
  //   '@aws-cdk/core',
  //   '@aws-cdk/aws-sns',
  //   '@aws-cdk/aws-sns-subscriptions',
  //   '@aws-cdk/custom-resources',
  // ],
  autoDetectBin: false,
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
      secret: 'AUTOMATION_GITHUB_TOKEN',
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['neilkuan'],
  },
  publishToPypi: {
    distName: 'cdk-gitlab-runner',
    module: 'cdk_gitlab_runner',
  },
  workflowNodeVersion: '^14.17.0',
  bundledDeps: [
    '@aws-cdk/assert@^1.134.0',
  ],
});
project.package.addField('resolutions', {
  'xmldom': 'github:xmldom/xmldom#0.7.0',
  'ansi-regex': '^5.0.1',
});
const common_exclude = ['cdk.out', 'cdk.context.json', 'yarn-error.log', 'coverage', 'venv'];
project.gitignore.exclude(...common_exclude);

project.npmignore.exclude(...common_exclude, 'image');
project.synth();
