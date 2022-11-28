const mongoose = require("mongoose");
const redis = require("redis");

const redisUrl = 'redis://127.0.0.1:6379';
let client;
if(process.env.REDISCLOUD_URL){
  client = redis.createClient(process.env.REDISCLOUD_URL)
} else {
  client = redis.createClient(redisUrl)
}

(async () => { await client.connect(); })();

// client.hGet = util.promisify(client.hGet);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = { time: 86400 }) {
  this.useCache = true;
  this.time = options.time;
  this.hashKey = JSON.stringify(options.key || this.mongooseCollection.name);

  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return await exec.apply(this, arguments);
  }

  const key = JSON.stringify({
    ...this.getQuery()
  });

  const cacheValue = await client.hGet(this.hashKey, key);

  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    console.log("Response from Redis");
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);
  console.log(this.time);
  client.hSet(this.hashKey, key, JSON.stringify(result));
  client.expire(this.hashKey, this.time);

  console.log("Response from MongoDB");
  return result;
};

module.exports = 
    function clearCache(hashkey){   
        client.del(JSON.stringify(hashkey))
    }