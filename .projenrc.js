const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.20.0',
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