const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.21.0',
  defaultReleaseBranch: 'main',
  name: 'collections-app-ex',

  deps: [
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/util-dynamodb',
  ],
  devDeps: [
    'aws-sdk-client-mock',
  ],
});
project.synth();