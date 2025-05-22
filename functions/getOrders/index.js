const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient();

exports.handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE
    };
    const data = await dynamoDbClient.send(new ScanCommand(params));
    const orders = (data.Items || []).map(item => ({
      orderId: item.orderId?.S || '',
      orderDetails: {
        customerName: item.orderDetails?.M?.customerName?.S || '',
        items: item.orderDetails?.M?.items?.L?.map(i => ({
          name: i.M?.name?.S || '',
          quantity: parseInt(i.M?.quantity?.N || '0'),
          price: parseFloat(i.M?.price?.N || '0')
        })) || [],
        totalAmount: parseFloat(item.orderDetails?.M?.totalAmount?.N || '0'),
        orderDate: item.orderDetails?.M?.orderDate?.S || ''
      }
    }));
    return { statusCode: 200, headers, body: JSON.stringify(orders) };
  } catch (error) {
    console.error('Error retrieving orders:', error.message, error.stack);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Error retrieving orders', error: error.message }) };
  }
};