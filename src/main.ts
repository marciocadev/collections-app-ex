import { join } from 'path';
import { App, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { ApiKey, AwsIntegration, Deployment, JsonSchemaType, JsonSchemaVersion, Method, MethodLoggingLevel, RestApi, Stage, UsagePlan } from 'aws-cdk-lib/aws-apigateway';
import { Alias, Function, IVersion, Runtime, Version } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class MyStack extends Stack {
  lambda: Function;
  restApi: RestApi;

  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    this.lambda = new NodejsFunction(this, 'InsertItem', {
      functionName: 'collection-insert-ex',
      entry: join(__dirname, './lambda-fns/insert-item.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
      },
    });

    let aliasObjList: Alias[] = [];
    const aliasList: {[key:string]: any}[] = [
      { name: 'Dev' },
      { name: 'Stage1', version: 63},
    ];
    for (let aliasObj of aliasList) {
      let version: IVersion;
      if (aliasObj.version) {
        version = Version.fromVersionAttributes(this, 'CollectionsVersion', {
          lambda: this.lambda,
          version: aliasObj.version.toString(),
        });
      } else {
        version = this.lambda.currentVersion;
      }
      aliasObjList.push(
        new Alias(this, 'CollectionsAlias'.concat(aliasObj.name), {
          aliasName: aliasObj.name.toLowerCase(),
          version: version,
        })  
      );
    }

    this.restApi = new RestApi(this, 'CollectionsGateway', {
      restApiName: 'collections-ex',
      deploy: false,
    });
    
    const responseModel = this.getResponseModel();
    const errorModel = this.getErrorResponseModel();
    let methodList: Method[] = [];

    const collectionsResource = this.restApi.root.addResource('collections');
    const bookResource = collectionsResource.addResource('book');
    methodList.push(
      bookResource.addMethod('POST', this.getBookIntegration(), {
        apiKeyRequired: true,
        methodResponses: [
          { statusCode: '200', responseModels: { 'application/json': responseModel } },
          { statusCode: '400', responseModels: { 'application/json': errorModel } },
        ],
      })
    );
    const cdResource = collectionsResource.addResource('cd');
    methodList.push(
      cdResource.addMethod('POST', this.getCDIntegration(), {
        apiKeyRequired: true,
        methodResponses: [
          { statusCode: '200', responseModels: { 'application/json': responseModel } },
          { statusCode: '400', responseModels: { 'application/json': errorModel } },
        ],
      })
    );

    const apiKey = new ApiKey(this, 'CollectionsApiKey', {
      apiKeyName: 'CollectionsApiKey',
      value: '6230314823798cf51af4121cf1caf4f4',
      enabled: true,
    });
    const usagePlan = new UsagePlan(this, 'UsagePlan', {
      name: 'CollectionsUsagePlan',
    });
    usagePlan.addApiKey(apiKey);

    // .concat(new Date().toISOString())
    const deployment = new Deployment(this, 'Deployment', {
      api: this.restApi,
    });
    const stageList = ['Dev', 'Stage1'];
    for (let stageName of stageList) {
      const stage = new Stage(this, 'CollectionsStage'.concat(stageName), {
        deployment: deployment,
        stageName: stageName.toLowerCase(),
        tracingEnabled: true,
        dataTraceEnabled: true,
        loggingLevel: MethodLoggingLevel.ERROR,
        variables: {
          lambdaAlias: stageName.toLowerCase(),
        },
      });
      if (stageName.toLowerCase() === 'dev') {
        this.restApi.deploymentStage = stage;  
      }
      usagePlan.addApiStage({
        api: this.restApi,
        stage: stage,
      });
    }

    const principal = new ServicePrincipal('apigateway.amazonaws.com');
    for (let s of stageList) {
      for (let a of aliasObjList) {
        for (let m in methodList) {
          const id = 'CollectionsPermissions'.concat(s).concat(a.aliasName).concat(m);
          const stageName = this.restApi.deploymentStage.stageName;
          a.addPermission(id, {
            principal: principal,
            action: 'lambda:InvokeFunction',
            scope: methodList[m],
            sourceArn: methodList[m].methodArn.replace(stageName, s.toLowerCase()),
          });
        }
      }
    }
  }

  getErrorResponseModel() {
    return this.restApi.addModel('CollectionsErrorResponseModel', {
      contentType: 'application/json',
      modelName: 'ErrorModel',
      schema: {
        schema: JsonSchemaVersion.DRAFT4,
        title: 'errorResponse',
        type: JsonSchemaType.OBJECT,
      },
    });
  }

  getResponseModel() {
    return this.restApi.addModel('CollectionsResponseModel', {
      contentType: 'application/json',
      modelName: 'ResponseModel',
      schema: {
        schema: JsonSchemaVersion.DRAFT4,
        title: 'pollResponse',
        type: JsonSchemaType.OBJECT,
      },
    });
  }

  getCDIntegration() {
    return new AwsIntegration({
      service: 'lambda',
      proxy: false,
      path: `2015-03-31/functions/${this.lambda.functionArn}`.concat(':${stageVariables.lambdaAlias}/invocations'),
      options: {
        requestTemplates: { 'application/json': `{
  "itemType": "cd",
  "title": $input.json('$.title'),
  "artist": $input.json('$.artist'),
  "musicList": $input.json('$.musicList')
}`
        },
        integrationResponses: [
          { statusCode: '200' },
          {
            statusCode: '400',
            selectionPattern: '.*"code":400.*',
            responseTemplates: { 'application/json': `#set ($errorMessageObj = $util.parseJson($input.path('$.errorMessage')))
{
  "exception": "$errorMessageObj.exception",
  "message": "$errorMessageObj.message"
}`
            },
          },
        ],
      },
    });
  }

  getBookIntegration() {
    return new AwsIntegration({
      service: 'lambda',
      proxy: false,
      path: `2015-03-31/functions/${this.lambda.functionArn}`.concat(':${stageVariables.lambdaAlias}/invocations'),
      options: {
        requestTemplates: { 'application/json': `{
  "itemType": "book",
  "title": $input.json('$.title'),
  "author": $input.json('$.author'),
  "ISBN": $input.json('$.ISBN')
}`
        },
        integrationResponses: [
          { statusCode: '200' },
          {
            statusCode: '400',
            selectionPattern: '.*"code":400.*',
            responseTemplates: { 'application/json': `#set ($errorMessageObj = $util.parseJson($input.path('$.errorMessage')))
{
  "exception": "$errorMessageObj.exception",
  "message": "$errorMessageObj.message"
}`
            },
          },
        ],
      },
    });
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