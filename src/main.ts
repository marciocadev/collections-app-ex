import { join } from 'path';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { ApiKey, LambdaIntegration, MethodLoggingLevel, RestApi, UsagePlan } from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, 'InsertItem', {
      functionName: 'collection-insert-ex',
      entry: join(__dirname, './lambda-fns/insert-item.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
    });

    const gateway = new RestApi(this, 'CollectionsGateway', {
      restApiName: 'collections-ex',
      deployOptions: {
        tracingEnabled: true,
        dataTraceEnabled: true,
        loggingLevel: MethodLoggingLevel.ERROR,
      },
    });
    
    const collectionsResource = gateway.root.addResource('collections');
    const bookResource = collectionsResource.addResource('book');
    bookResource.addMethod('POST', new LambdaIntegration(lambda), {
      apiKeyRequired: true,
    });

    const apiKey = new ApiKey(this, 'CollectionsApiKey', {
      apiKeyName: 'CollectionsApiKey',
      value: '6230314823798cf51af4121cf1caf4f4',
      enabled: true,
    });
    const usagePlan = new UsagePlan(this, 'UsagePlan', {
      name: 'CollectionsUsagePlan',
    });
    usagePlan.addApiStage({
      stage: gateway.deploymentStage,
      api: gateway,
    });
    usagePlan.addApiKey(apiKey);
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'collections-app-ex-dev', { env: devEnv });
// new MyStack(app, 'collections-app-ex-prod', { env: prodEnv });

app.synth();