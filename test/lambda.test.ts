import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MyStack } from '../src/main';

// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html

test('Lambda insert-item exist', () => {
  //GIVEN
  const app = new App();
  const stack = new MyStack(app, 'test');
  // WHEN
  const template = Template.fromStack(stack);
  // THEN
  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: 'collection-insert-ex',
  });
});