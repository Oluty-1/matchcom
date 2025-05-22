const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const sqsClient = new SQSClient();

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (error) {
    console.error('Invalid JSON:', error);
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid JSON body' }) };
  }

  const { orderId, orderDetails } = body;

  if (!orderId || !orderDetails) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing orderId or orderDetails' }) };
  }

  const params = {
    MessageBody: JSON.stringify({ orderId, orderDetails }),
    QueueUrl: process.env.SQS_QUEUE_URL
  };

  try {
    await sqsClient.send(new SendMessageCommand(params));
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Order submitted' }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Error submitting order' }) };
  }
};