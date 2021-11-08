/* eslint-disable no-console */
// dependencies
const util = require('util');

const { MongoDBClient } = require('./mongodb');
const { RedisClient } = require('./redis');
const { APIGatewayClient } = require('./api_gateway');

// API Gateway setup
const apiGateway = new APIGatewayClient();

// mongoDB setup
const mongoUri = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
const mongoClient = new MongoDBClient(mongoUri);

// Redis setup
const redisClient = new RedisClient({
  host: process.env.REDIS_HOST, // Redis host
  port: process.env.REDIS_PORT, // Redis port
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 1,
});

/* eslint-disable no-use-before-define */
exports.handler = async (event, context, callback) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    // Read options from the event parameter.
    console.log('Reading options from event:\n', util.inspect(event, { depth: 5 }));
    const body = JSON.parse(event.body);

    const objects = await findObjectsByFilter(body.terms);

    console.log(objects);

    return callback(null, apiGateway.formatAPIGatewayResponse(objects));
  } catch (error) {
    callback(error);
    return false;
  }
};
/*  eslint-enable no-use-before-define */

const findObjectsByFilter = async (terms) => {
  try {
    const objectsFromCache = await redisClient.findObjectsFromRedisByFilter(terms);

    console.log(`Result from cache: ${objectsFromCache}`);

    if (objectsFromCache && objectsFromCache.length) {
      return objectsFromCache;
    }

    const objectsFromDatabase = await mongoClient.findObjectsFromMongoByFilter(terms);

    if (objectsFromDatabase.length) {
      await redisClient.saveObject(terms, objectsFromDatabase);
    }

    return objectsFromDatabase;
  } catch (e) {
    console.error(e);
    console.log('Going to fallback to database...');

    return mongoClient.findObjectsFromMongoByFilter(terms);
  }
};
