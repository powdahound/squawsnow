var jsdom = require("jsdom");
const { JSDOM } = jsdom;

const trackerUrl = "http://squawalpine.com/skiing-riding/weather-conditions-webcams/squaw-valley-snowfall-tracker";

// returns all records from all seasons
function getAllRecords() {
  return JSDOM.fromURL(trackerUrl).then(dom => {
    return parseDataFromResponse(dom);
  });
}

function *getLatestAvailable() {
  var records = yield getAllRecords();
  if (records === null) {
    console.error("Unable to get latest available data.");
    return null;
  }
  var currentSeasonData = records[records.length-1]['data'];
  return currentSeasonData[currentSeasonData.length-1];
}

function parseDataFromResponse(dom) {
  const $ = require("jquery")(dom.window);

  // this div will contain the tabs and the content tables for each season
  var container = $("div.field-name-field-tabs");
  // the clickable tabs contain the season names. "2014-15", for example
  var seasonTabs = $("ul li a", container);
  // these tables contain the rows with data
  var seasonTables = $("div.tpl_table table", container);

  //console.log("Found", seasonTabs.length, "tabs and", seasonTables.length, "season tables");

  // gather data by season
  // [
  //   {
  //     name: "2009-10",
  //     snow-days: 64,
  //     6200-total: "375"",
  //     8000-total: "561"",
  //     data: [
  //       {
  //         date: "Saturday, October 3, 2009",
  //         6200-new: "2"",
  //         6200-total: "2"",
  //         8000-new: "4"",
  //         8000-total: "4""
  //       },
  //       ...
  //     ],
  //   },
  //   {
  //     name: "2010-11",
  //     ...
  //   }
  // ]
  var data = [];

  seasonTabs.each(function(i) {
    var seasonName = $(this).html();
    var seasonRows = $('tr', seasonTables[i]);
    seasonRows = $(seasonRows.get().reverse());

    //console.log('Season', seasonName, 'has', seasonRows.length, 'entries');
    var seasonData = [];

    seasonRows.each(function() {
      // fill an array with the text content of each <td> in this row
      var entryData = $(this).children().map(function () {
        return $(this).text().trim();
      }).get();

      // make sure this row has a valid date. this also ignores the "As of 6am" header rows
      if (entryData[0].match(/\w+, \w+ \d+, \d\d\d\d/) == null) {
        return null;
      }

      seasonData.push({
        "date": entryData[0],
        "6200-new": entryData[1],
        "6200-total": entryData[2],
        "8000-new": entryData[3],
        "8000-total": entryData[4]
      });
    });

    data.push({
      "name": seasonName,
      "snow-days": seasonData.length,
      "6200-total": seasonData[seasonData.length-1]["6200-total"],
      "8000-total": seasonData[seasonData.length-1]["8000-total"],
      "data": seasonData,
    });
  });

  // sort by season name
  data = data.sort(function(a, b) {
    return a['name'] > b['name']
  });

  return data;
}

module.exports.getAllRecords = getAllRecords;
module.exports.getLatestAvailable = getLatestAvailable;
