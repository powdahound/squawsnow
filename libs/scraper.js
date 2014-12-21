var jsdom = require("jsdom");

// returns all records from all seasons
function getAllRecords() {
  return new Promise(function(resolve, reject) {
    jsdom.env({
      url: "http://squawalpine.com/skiing-riding/weather-conditions-webcams/squaw-valley-snowfall-tracker",
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (err, window) {
        if (err) {
          console.error("Unable to fetch site content", err);
          resolve(null);
        } else {
          resolve(parseDataFromResponse(window));
        }
      }
    });
  });
}

function *getLatestAvailable() {
  var records = yield getAllRecords();
  if (records == null) {
    return null;
  }
  var seasonIds = Object.keys(records);
  var currentSeason = seasonIds[0];
  return records[currentSeason].pop();
}

function parseDataFromResponse(window) {
  var $ = window.$;

  // this div will contain the tabs and the content tables for each season
  var container = $("div.field-name-field-tabs");
  // the clickable tabs contain the season names. "2014-15", for example
  var seasonTabs = $("ul li a", container);
  // these tables contain the rows with data
  var seasonTables = $("div.tpl_table table", container);

  //console.log("Found", seasonTabs.length, "tabs and", seasonTables.length, "season tables");

  // gather data by season
  // {
  //    "2009-10": [
  //      {
  //        "date": "Thursday, May 27, 2010",
  //        "6200-new": '1-2"',
  //        "6200-total": '375"',
  //        "8000-new": '2-4"',
  //        "8000-total": '561"'
  //      },
  //      ...
  //    ],
  //    "2010-11": [...]
  // }
  var data = {};

  seasonTabs.each(function(i) {
    var seasonName = $(this).html();
    var seasonRows = $('tr', seasonTables[i]);
    seasonRows = $(seasonRows.get().reverse());

    //console.log('Season', seasonName, 'has', seasonRows.length, 'entries');
    data[seasonName] = [];

    seasonRows.each(function() {
      // fill an array with the text content of each <td> in this row
      var entryData = $(this).children().map(function () {
        return $(this).html();
      }).get();

      // make sure this row has a valid date. this also ignores the "As of 6am" header rows
      if (entryData[0].match(/\w+, \w+ \d+, \d\d\d\d/) == null) {
        return null;
      }

      data[seasonName].push({
        "date": entryData[0],
        "6200-new": entryData[1],
        "6200-total": entryData[2],
        "8000-new": entryData[3],
        "8000-total": entryData[4]
      });
    });

  });

  return data;
}

module.exports.getAllRecords = getAllRecords;
module.exports.getLatestAvailable = getLatestAvailable;
