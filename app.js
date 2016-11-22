var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var request = require('superagent');
var fs = require('fs');

app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

// LOGGER
var logFactory = require('./log.js');
var logger = logFactory.create("rest");

var userAgent = "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19";

var searchPrefixes = [
  "https://www.amazon.co.uk/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords={}",
  "http://www.ebay.co.uk/sch/i.html?_from=R40&_sacat=0&_nkw={}",
  //"https://m.aliexpress.com/search.htm?keywords={}",
  "https://www.aliexpress.com/af/{}.html",
  //"http://www.miniinthebox.com/es/index.php?main_page=advanced_search_result&inc_subcat=1&search_in_description=0&keyword={}",
  "http://m.miniinthebox.com/es/search?q={}"
]

var makeRequest = function(url, callback){
  logger.info("Searching URL "+ url);
  request
    .get(url)
    .set('User-Agent', userAgent)
    .end(function(err, res){
      logger.info("Callback from " +url, err, res);
        if (err) {
          logger.error("Got ERROR from " +url+": "+err);
          callback({error: "Unable to load URL "+ url + ": "+err, url: url});
        } else {
          console.log("Got reply from " + url);
          var domain = url.split('.')[1];
          var iframe = 'iframes/'+domain+'.html';
          var path = __dirname + '/public/'+iframe;
          console.log("Saving iframe on " +path);
          fs.writeFile(path, res.text, function(err) {
            if(err) logger.error(err);
          });

          callback({url: url, iframe: iframe});
        }
  });
}
app.get('/search', function(req, res){
    var search = req.query.q;

    var results = [];
    for (var i=0; i < searchPrefixes.length; i++){
      var prefix = searchPrefixes[i];
      var url = prefix.replace('{}', search.replace(/\s/,'+'));
      makeRequest(url , function(response){
        results.push(response);
        logger.info("Got results "+ results.length);
        if(results.length == searchPrefixes.length) res.json(results);
      });

    }
});


app.listen(8994);

logger.info("Rest API started on port 8994");
