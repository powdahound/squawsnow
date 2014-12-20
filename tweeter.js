var co = require('co');
var scraper = require('./scraper.js');

var main = function *() {
  // 1: scrape data from squaw's site
  var records = yield scraper.getAllRecords();

  // 2: find which snowfall we last tweeted
  var seasonIds = Object.keys(records);
  var currentSeason = seasonIds[0];
  var latestAvailable = records[currentSeason].pop();
  console.log('seasonIds =', seasonIds);
  console.log('currentSeason =', currentSeason);
  console.log('latestAvailable =', latestAvailable);
  var latestTweeted = null;

  // 3: tweet if there's a record newer than we've seen
  if (latestTweeted == null) {
    console.log('no last_seen - populate it');
  } else if (latestTweeted['6200-total'] != latestAvailable['6200-total']
    || latestTweeted['8000-total'] != latestAvailable['8000-total']) {
    console.log('new data to tweet!');
    // storeLatest();
    // postTweet();
  }

};

if (require.main === module) {
  co(main).catch(function(err) {
    console.error(err);
  });
}
