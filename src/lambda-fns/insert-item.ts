import {
  DynamoDBClient, PutItemCommand, PutItemCommandInput,
  DynamoDBServiceException,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export const handler = async(event: any) => {

  console.log(event);

  const input: PutItemCommandInput = {
    TableName: process.env.TABLE_NAME,
    Item: marshall(event),
    ConditionExpression: 'attribute_not_exists(title) and attribute_not_exists(itemType)',
  };

  try {
    const result = await dynamoDBClient.send(new PutItemCommand(input));
    console.log(result);
  } catch (e) {
    if (e instanceof DynamoDBServiceException) {
      console.error({
        name: e.name,
        message: e.message,
        code: e.$metadata.httpStatusCode ?? 500,
        requestId: e.$metadata.requestId ?? '',
      });
      const error = {
        exception: e.name,
        message: e.message,
        code: e.$metadata.httpStatusCode ?? 500,
      };
      throw new Error(JSON.stringify(error));
    }
  }

  return {
    // statusCode: 200,
    detail: 'Item inserido com sucesso',
  };
};