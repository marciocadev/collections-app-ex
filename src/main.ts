import { join } from 'path';
import { App, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { ApiKey, AwsIntegration, Deployment, JsonSchemaType, JsonSchemaVersion, MethodLoggingLevel, RestApi, Stage, UsagePlan } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Alias, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const table = new Table(this, 'CollectionTable', {
      tableName: 'collections-ex',
      partitionKey: {
        name: 'type',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'title',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambda = new NodejsFunction(this, 'InsertItem', {
      functionName: 'collection-insert-ex',
      entry: join(__dirname, './lambda-fns/insert-item.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
      },
    });
    table.grantWriteData(lambda);
    const alias = new Alias(this, 'InsertItemAlias', {
      aliasName: 'dev',
      version: lambda.currentVersion,
    });

    const apiKey = new ApiKey(this, 'CollectionsApiKey', {
      apiKeyName: 'CollectionsApiKey',
      value: '6230314823798cf51af4121cf1caf4f4',
    });

    const gateway = new RestApi(this, 'CollectionsGateway', {
      restApiName: 'collections-ex',
      deploy: false,
    });
    const collectionsResource = gateway.root.addResource('collections');
    const bookResource = collectionsResource.addResource('book');

    const integration = new AwsIntegration({
      service: 'lambda',
      proxy: false,
      path: `2015-03-31/functions/${lambda.functionArn}`.concat(':${stageVariables.lambdaAlias}/invocations'),
      options: {
        requestTemplates: {
          'application/json': `
{
  "type": "book",
  "title": $input.json('$.title'),
  "detail": $input.json('$.detail')
}`,
        },
        integrationResponses: [
          { statusCode: '200' },
          { 
            statusCode: '404',
            selectionPattern: '.*"status":404.*',
            responseTemplates: {
              'application/json': `
#set ($errorMessageObj = $util.parseJson($input.path('$.errorMessage')))
{
  "code": "$errorMessageObj.code",
  "detail": "$errorMessageObj.detail"
}`,
            },
          },
        ],
      },
    });

    const responseModel = gateway.addModel('CollectionsResponseModel', {
      contentType: 'application/json',
      modelName: 'ResponseModel',
      schema: {
        schema: JsonSchemaVersion.DRAFT4,
        title: 'pollResponse',
        type: JsonSchemaType.OBJECT,
      },
    });
    const errorModel = gateway.addModel('CollectionsErrorModel', {
      contentType: 'application/json',
      modelName: 'ErrorModel',
      schema: {
        schema: JsonSchemaVersion.DRAFT4,
        title: 'errorResponse',
        type: JsonSchemaType.OBJECT,
      },
    });
    const method = bookResource.addMethod('POST', integration, {
      apiKeyRequired: true,
      methodResponses: [
        { statusCode: '200', responseModels: { 'application/json': responseModel } },
        { statusCode: '404', responseModels: { 'application/json': errorModel } },
      ],
    });

    const deployment = new Deployment(this, 'Deployment'.concat(new Date().toISOString()), {
      api: gateway,
    });
    const stage = new Stage(this, 'Stage', {
      deployment: deployment,
      stageName: 'dev',
      tracingEnabled: true,
      dataTraceEnabled: true,
      loggingLevel: MethodLoggingLevel.ERROR,
      variables: {
        lambdaAlias: 'dev',
      },
    });
    gateway.deploymentStage = stage;

    alias.addPermission('CollectionsPermission', {
      principal: new ServicePrincipal('apigateway.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      scope: method,
      sourceArn: method.methodArn,
    });

    const usagePlan = new UsagePlan(this, 'UsagePlan', {
      name: 'CollectionsUsagePlan',
    });
    usagePlan.addApiStage({
      stage: stage,
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