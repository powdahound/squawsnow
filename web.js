var koa = require('koa');
var router = require('koa-router');
var scraper = require('./libs/scraper.js');
var cache = require('./libs/cache.js').Cache;
var twitter = require('./libs/twitter.js');
var mail = require('./libs/mail.js');

var app = koa();
app.use(router(app));

app.get('/data', function *(next) {
  var records = yield scraper.getAllRecords();
  this.body = JSON.stringify(records, null, 2);
});

app.post('/update', function *(next) {

  // simple auth check to make sure this endpoint can't be hit by anyone
  if (!this.request.query.key || this.request.query.key != process.env.AUTH_KEY) {
    this.status = 401;
    this.body = "ERROR: Invalid key";
    return;
  }

  // 1: get latest available from squaw's site
  var latestAvailable = yield scraper.getLatestAvailable();
  if (latestAvailable == null) {
    this.status = 500;
    this.body = "ERROR: Unable to scrape snowfall data.";
    return;
  }

  // 2: find which snowfall we last tweeted
  var latestTweeted = yield cache.getLatestTweeted();

  // 3: tweet if there's a record newer than we've seen. we use the totals data as the only
  // indicator since they will sometimes adjust the other data if they make typos or other
  // errors. plus, the total is all we really care about
  if (latestTweeted == null) {
    console.log('No record of last tweeted value. Populating it.');
    this.body = "OK - Populating empty cache";
    yield cache.storeLatestTweeted(latestAvailable);
  } else if (latestTweeted['6200-total'] != latestAvailable['6200-total']
    || latestTweeted['8000-total'] != latestAvailable['8000-total']) {
    console.log('It snowed!');
    yield twitter.notify(latestAvailable);
    yield mail.notify(latestAvailable);
    yield cache.storeLatestTweeted(latestAvailable);
    this.body = "OK - Found new snow and Tweeted";
  } else {
    console.log('No new snow. Latest was on', latestAvailable['date']);
    this.body = "OK - No new snow since " + latestAvailable['date'];
  }
});

app.listen(process.env.PORT);
console.log('Listening on port', process.env.PORT);
