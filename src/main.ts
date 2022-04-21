import { join } from 'path';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Alias, Runtime, Version } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

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
    });

    const lambda = new NodejsFunction(this, 'InsertItem', {
      functionName: 'collection-insert-ex',
      entry: join(__dirname, './lambda-fns/insert-item.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
    });
    table.grantWriteData(lambda);

    const version = new Version(this, 'InsertItemVersion', {
      lambda: lambda,
    });
    new Alias(this, 'InsertItemAlias', {
      aliasName: 'dev',
      version: version,
    });

    const gateway = new RestApi(this, 'CollectionsGateway', {
      restApiName: 'collections-ex',
    });
    const collectionsResource = gateway.root.addResource('collections');
    const bookResource = collectionsResource.addResource('book');
    bookResource.addMethod('POST', new LambdaIntegration(lambda));
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