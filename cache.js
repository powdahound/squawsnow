var fs = require('fs');
var redis = require('redis');
var coRedis = require('co-redis');
var url = require('url');

// fixme: should probably have an abstract class here or something

var FileCache = {
  tmpFile: "/tmp/squawsnow.json",

  getLatestTweeted: function() {
    return new Promise(function(resolve, reject) {
      fs.readFile(FileCache.tmpFile, function(err, data) {
        if (err) {
          console.log('Unable to read latest snowfall:', err);
          resolve(null);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  },

  storeLatestTweeted: function(data) {
    var serialized = JSON.stringify(data);
    return new Promise(function(resolve, reject) {
      fs.writeFile(FileCache.tmpFile, serialized, function(err) {
        if (err) {
          reject(err);
        } else {
          console.log('Stored latest snowfall:', serialized);
          resolve(true);
        }
      });
    });
  }
};

var RedisCache = {
  client: null,
  latestTweetedKey: "latestTweeted",

  getClient: function() {
    if (RedisCache.client == null) {
      // REDISTOGO_URL format is:
      //  redis://redistogo:password@blah.redistogo.com:6379/
      // Let's parse it so we can provide details explicitly
      var parsed = url.parse(process.env.REDISTOGO_URL);
      var client = redis.createClient(parsed.port, parsed.hostname, {
        auth_pass: parsed.auth.split(':')[1]
      });
      RedisCache.client = coRedis(client);
    }

    return RedisCache.client;
  },

  getLatestTweeted: function*() {
    var client = this.getClient();
    var value = yield client.get(RedisCache.latestTweetedKey);
    if (value != null) {
      value = JSON.parse(value);
    }
    client.end(); // fixme: should we do this at the end of the script somehow instead?
    return value;
  },

  storeLatestTweeted: function*(data) {
    var client = this.getClient();
    yield client.set(RedisCache.latestTweetedKey, JSON.stringify(data));
    client.end(); // fixme: should we do this at the end of the script somehow instead?
    return true;
  }
};

// fixme: there must be a nicer way to expose the proper interface
module.exports.Cache = process.env.REDISTOGO_URL ? RedisCache : FileCache;
