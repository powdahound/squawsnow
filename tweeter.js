var scraper = require('./scraper.js');

scraper.getAllRecords(function(errors, data) {
  console.log(data);
});