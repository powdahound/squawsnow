var jsdom = require("jsdom");

jsdom.env(
  "http://squawalpine.com/skiing-riding/weather-conditions-webcams/squaw-valley-snowfall-tracker",
  ["http://code.jquery.com/jquery.js"],
  handleHTMLResponse);

function handleHTMLResponse(errors, window) {
  if (errors) {
    console.error("Unable to fetch site content", errors);
    return null;
  }

  var $ = window.$;

  // this div will contain the tabs and the content tables for each season
  var container = $("div.field-name-field-tabs");
  // the clickable tabs contain the season names. "2014-15", for example
  var season_tabs = $("ul li a", container);
  // these tables contain the rows with data
  var season_tables = $("div.tpl_table table", container);

  console.log("Found", season_tabs.length, "tabs and", season_tables.length, "season tables");

  var data = {};

  season_tabs.each(function(i) {
    var season_name = $(this).html();
    var season_rows = $('tr', season_tables[i]);

    console.log('Season', season_name, 'has', season_rows.length, 'entries');

    season_rows.each(function() {
      var texts = $(this).children().map(function () {
        return $(this).html();
      }).get();
      console.log(texts);
    });

    //season_rows.each(function() {
    //  $(this).children().each(function() {
    //    console.log($(this).html());
    //  });
    //})
  });

}
