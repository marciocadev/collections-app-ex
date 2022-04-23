import { ConditionalCheckFailedException, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../../src/lambda-fns/insert-item';

describe('Validate insert-item lambda', () => {
  const OLD_ENV = process.env;
  const dynamoDBMock = mockClient(DynamoDBClient);

  beforeAll(() => {
    process.env = {
      TABLE_NAME: 'collections-ex',
      ...OLD_ENV,
    };
  });

  beforeEach(() => {
    dynamoDBMock.reset();
  });

  test('insert book', async() => {
    dynamoDBMock
      .on(PutItemCommand)
      .resolves({});

    const event = {
      title: 'A Guerra dos Consoles',
      author: 'Blake J. Harris',
      ISBN: '978-85-8057-822-5',
    };

    const result = await handler(event);

    expect(result).toMatchObject({
      detail: 'Item inserido com sucesso',
    });
  });

  test('duplicated item', async() => {
    const exception = new ConditionalCheckFailedException({
      $metadata: {
        httpStatusCode: 400,
        requestId: '',
      },
    });

    dynamoDBMock.on(PutItemCommand).rejects(exception);

    await expect(async() => {
      const event = {
        title: 'A Guerra dos Consoles',
        author: 'Blake J. Harris',
        ISBN: '978-85-8057-822-5',
      };
      await handler(event);
    }).rejects.toThrow(Error);
  });
});