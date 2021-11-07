/* eslint-disable no-console */
// dependencies
const AWS = require('aws-sdk');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const Redis = require('ioredis');
const util = require('util');

// S3 client setup
const s3 = new AWS.S3();

// mongoDB setup
const uri = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri);

// Redis setup
const redis = new Redis({
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
    console.log('Reading options from event:\n', util.inspect(event, {depth: 5}));
    const body = JSON.parse(event.body);

    const objects = await findObjectsByFilter(body.terms);
    const response = formatAPIGatewayResponse(objects);

    console.log(response);

    return callback(null, response);
  } catch (error) {
    callback(error);
    return false;
  }
};
/*  eslint-enable no-use-before-define */

const formatFiltersForMongoQuery = (terms) => {
  const filtersForNestedObject = [];

  filtersForNestedObject.push({ imageBucket: process.env.S3_BUCKET_NAME});

  terms.forEach((term) => {
    filtersForNestedObject.push({ 'analysisResult.name': term.toLowerCase() });
  });

  return filtersForNestedObject;
};

const buildRedisKey = (terms) => {
  return `${process.env.ENVIRONMENT}:${terms.join('-')}`;
};

const findObjectsFromMongoByFilter = async (terms) => {
  console.log('Searching on database...');
  try {
    await mongoClient.connect();

    const database = mongoClient.db(process.env.MONGODB_DATABASE);
    const collection = database.collection(process.env.MONGODB_COLLECTION);
    const filters = formatFiltersForMongoQuery(terms);

    const results = await collection.find({ $and: filters }).toArray();
    console.log(results);

    if (redis) {
      console.log('Building cache with results...');
      await redis.set(buildRedisKey(terms), JSON.stringify(results));
    }

    return results;
  } finally {
    await mongoClient.close();
  }
};

const findObjectsFromRedisByFilter = async(terms) => {
  return JSON.parse(await redis.get(buildRedisKey(terms)));
};

const findObjectsByFilter = async(terms) => {
  try {
    const objectsFromCache = redis ? await findObjectsFromRedisByFilter(terms) : null;

    console.log(`Result from cache: ${objectsFromCache}`);

    return (objectsFromCache && objectsFromCache.length)
      ? objectsFromCache : await findObjectsFromMongoByFilter(terms);
  } catch (e) {
    console.error(e);
    console.log('Going to fallback to database...');

    return findObjectsFromMongoByFilter(terms);
  }
};

const formatAPIGatewayResponse = (objects) => {
  return {
    isBase64Encoded: false,
    statusCode: 200,
    body: JSON.stringify(objects),
  };
};

const formatRecord = (imageBucket, imageKey, imageHash) => ({
  imageBucket, imageKey, imageHash, createdAt: new Date().toISOString(),
});

const saveAnalysisResultToDatabase = async(imageBucket, imageKey, imageHash, analysisResult) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db(process.env.MONGODB_DATABASE);
    const collection = database.collection(process.env.MONGODB_COLLECTION);

    const recordBody = formatRecord(imageBucket, imageKey, imageHash, analysisResult);

    console.log(recordBody);

    return await collection.insertOne(recordBody);
  } finally {
    await mongoClient.close();
  }
};

const convertBufferToBase64 = (imageBuffer) => {
  return imageBuffer.toString('base64');
};

const getHash = (content) => {
  const hash = crypto.createHash('sha256');
  hash.update(content);

  return hash.digest('hex');
};
