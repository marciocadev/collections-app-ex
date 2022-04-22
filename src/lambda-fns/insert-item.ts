export const handler = async(event: any) => {
  console.log('first');

  console.log(event);

  const error = {
    status: 404,
    code: '404',
    detail: 'Erro',
  };
  // throw new Error(JSON.stringify(error));
  return {
    // statusCode: 200,
    body: event,
  };
};