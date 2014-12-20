var twitterAPI = require('node-twitter-api');

var twitter = new twitterAPI({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callback: 'http://twitter.com/squawsnow/#this-callback-is-not-used'
});

function tweetSnowfall(data) {
  var tweet = data['date'] + " — "
    + "New: " + data['6200-new'] + " at 6200', " + data['8000-new'] + " at 8000' — "
    + "Totals: " + data['6200-total'] + "/" + data['8000-total'];
  return postStatus(tweet);
}

function postStatus(text) {
  console.log('Posting tweet:', text);

  return new Promise(function(resolve, reject) {
    twitter.statuses("update", { status: text },
      process.env.TWITTER_ACCESS_TOKEN,
      process.env.TWITTER_ACCESS_TOKEN_SECRET,
      function (error, data, response) {
        if (error) {
          console.error("Error posting tweet:", error);
          resolve(false);
        } else {
          var url = "https://twitter.com/" + process.env.TWITTER_USERNAME + "/status/" + data['id_str'];
          console.log('Tweet posted!', url);
          resolve(true);
        }
      }
    );
  });
}

module.exports.tweetSnowfall = tweetSnowfall;
