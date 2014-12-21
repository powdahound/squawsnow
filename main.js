var co = require('co');
var scraper = require('./libs/scraper.js');
var cache = require('./libs/cache.js').Cache;
var twitter = require('./libs/twitter.js');

var main = function* () {
  // 1: get latest available from squaw's site
  var latestAvailable = yield scraper.getLatestAvailable();
  if (latestAvailable == null) {
    console.error("Unable to get latest available data. Aborting.");
    return;
  }

  // 2: find which snowfall we last tweeted
  var latestTweeted = yield cache.getLatestTweeted();

  // 3: tweet if there's a record newer than we've seen. we use the totals data as the only
  // indicator since they will sometimes adjust the other data if they make typos or other
  // errors. plus, the total is all we really care about
  if (latestTweeted == null) {
    console.log('No record of last tweeted value. Populating it.');
    yield cache.storeLatestTweeted(latestAvailable);
  } else if (latestTweeted['6200-total'] != latestAvailable['6200-total']
    || latestTweeted['8000-total'] != latestAvailable['8000-total']) {
    console.log('It snowed!');
    yield twitter.tweetSnowfall(latestAvailable);
    yield cache.storeLatestTweeted(latestAvailable);
  } else {
    console.log('No new snow. Latest was on', latestAvailable['date']);
  }
};

if (require.main === module) {
  co(main).catch(function(err) {
    console.error(err.stack);
  });
}
