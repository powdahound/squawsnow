var koa = require('koa');
var app = koa();
var scraper = require('./libs/scraper.js');

app.use(function *() {
  var records = yield scraper.getAllRecords();
  this.body = JSON.stringify(records, null, 2);
});

app.listen('DYNO' in process.env ? 80 : 3000);
