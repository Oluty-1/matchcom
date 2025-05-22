const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient();

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
  };

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (error) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid JSON body' }) };
  }

  const { orderId, orderDetails } = body;
  if (!orderId || !orderDetails) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing orderId or orderDetails' }) };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      orderId: { S: orderId },
      orderDetails: { M: {
        customerName: { S: orderDetails.customerName },
        items: { L: orderDetails.items.map(item => ({
          M: {
            name: { S: item.name },
            quantity: { N: item.quantity.toString() },
            price: { N: item.price.toString() }
          }
        })) },
        totalAmount: { N: orderDetails.totalAmount.toString() },
        orderDate: { S: orderDetails.orderDate }
      }}
    }
  };

  try {
    await dynamoDbClient.send(new PutItemCommand(params));
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Order updated' }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Error updating order' }) };
  }
};