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
  cdkVersion: '2.189.1',
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
  autoDetectBin: false,
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
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
  workflowNodeVersion: '^16.16.0',
  typescriptVersion: '^4.9',
  jsiiVersion: '~5.0.7',
  deps: [
    'compare-versions',
  ],
  bundledDeps: ['compare-versions'],
  minNodeVersion: '20.10.0',
  workflowNodeVersion: '20.10.0',
  typescriptVersion: '^5',
  jsiiVersion: '5.7.x',
});

const common_exclude = ['cdk.out', 'cdk.context.json', 'yarn-error.log', 'coverage', 'venv'];
project.gitignore.exclude(...common_exclude);

project.npmignore.exclude(...common_exclude, 'image');

project.package.addDevDeps(...['jest@^29', '@types/jest@^29', 'ts-jest@^29', 'jsii-rosetta@5.0.x', 'eslint@^8']);
project.synth();
