/* eslint-disable no-console */
const { MongoClient } = require('mongodb');

class MongoDBClient {
  constructor(uri) {
    this.mongoClient = new MongoClient(uri);
  }

  formatFiltersForMongoQuery(terms) {
    const filtersForNestedObject = [];

    filtersForNestedObject.push({ imageBucket: process.env.S3_BUCKET_NAME });

    terms.forEach((term) => {
      filtersForNestedObject.push({ 'analysisResult.name': term.toLowerCase() });
    });

    return filtersForNestedObject;
  }

  async findObjectsFromMongoByFilter(terms) {
    console.log('Searching on database...');
    try {
      await this.mongoClient.connect();

      const database = this.mongoClient.db(process.env.MONGODB_DATABASE);
      const collection = database.collection(process.env.MONGODB_COLLECTION);
      const filters = this.formatFiltersForMongoQuery(terms);

      const results = await collection.find({ $and: filters }).toArray();
      console.log(results);

      return results;
    } finally {
      await this.mongoClient.close();
    }
  }

  formatRecord(imageBucket, imageKey, imageHash) {
    return {
      imageBucket, imageKey, imageHash, createdAt: new Date().toISOString(),
    };
  }

  async saveAnalysisResultToDatabase(imageBucket, imageKey, imageHash, analysisResult) {
    try {
      await this.mongoClient.connect();

      const database = this.mongoClient.db(process.env.MONGODB_DATABASE);
      const collection = database.collection(process.env.MONGODB_COLLECTION);

      const recordBody = this.formatRecord(imageBucket, imageKey, imageHash, analysisResult);

      console.log(recordBody);

      return await collection.insertOne(recordBody);
    } finally {
      await this.mongoClient.close();
    }
  }
}

module.exports = { MongoDBClient };
