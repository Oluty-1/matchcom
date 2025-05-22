const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient();

exports.handler = async (event) => {
  for (const record of event.Records) {
    const { orderId, orderDetails } = JSON.parse(record.body);

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
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};