var fs = require('fs');
var tmpFile = "/tmp/squawsnow.json";

function getLatestTweeted() {
  return new Promise(function(resolve, reject) {
    fs.readFile(tmpFile, function(err, data) {
      if (err) {
        console.log('Unable to read latest snowfall:', err);
        resolve(null);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

function storeLatestTweeted(data) {
  var serialized = JSON.stringify(data);
  return new Promise(function(resolve, reject) {
    fs.writeFile(tmpFile, serialized, function(err) {
      if (err) {
        reject(err);
      } else {
        console.log('Stored latest snowfall:', serialized);
        resolve(true);
      }
    });
  });
}

module.exports.getLatestTweeted = getLatestTweeted;
module.exports.storeLatestTweeted = storeLatestTweeted;
