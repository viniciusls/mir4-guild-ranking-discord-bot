class APIGatewayClient {
  formatAPIGatewayResponse(objects) {
    return {
      isBase64Encoded: false,
      statusCode: 200,
      body: JSON.stringify(objects),
    };
  }
}

module.exports = { APIGatewayClient };
