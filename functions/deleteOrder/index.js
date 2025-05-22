const { DynamoDBClient, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient();

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
  };

  const orderId = event.pathParameters?.orderId;
  if (!orderId) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing orderId' }) };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      orderId: { S: orderId }
    }
  };

  try {
    await dynamoDbClient.send(new DeleteItemCommand(params));
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Order deleted' }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Error deleting order' }) };
  }
};