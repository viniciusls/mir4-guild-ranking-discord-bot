const Redis = require('ioredis');

class RedisClient {
  constructor(connOpts) {
    this.redisClient = new Redis(connOpts);
  }

  buildRedisKey(terms) {
    return `${process.env.ENVIRONMENT}:${terms.join('-')}`;
  }

  async findObjectsFromRedisByFilter(terms) {
    return JSON.parse(await this.redisClient.get(this.buildRedisKey(terms)));
  }

  async saveObjectToRedis(terms, results) {
    console.log('Building cache with results...');
    await this.redisClient.set(this.buildRedisKey(terms), JSON.stringify(results));
  }
}

module.exports = { RedisClient };
