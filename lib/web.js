var express = require('express')
  , routes = require('../routes')
  , user = require('../routes/user')
  , http = require('http')
  , path = require('path');

var app = express()
  , server = http.createServer(app)

var twitter = require('ntwitter');
var expand = require('urlexpand');
var request = require("request");
var cheerio = require("cheerio");

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/api', function(req, res) {
        res.write('API');
    });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'));

var twit = new twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});

twit.stream('statuses/filter', {'track':'#2instawithlove'}, function(stream) {
  stream.on('data', function (data) {
    var sub = data.text.search("http://t.co");
    if (sub >= 1) {
      console.log("t.co link found! Parsing.");
      expandurl(data.text.substring(sub));
    };
  });
});

function expandurl(data) {
  expand(data, function (err, expurl) {
      var instsub = expurl.url.search("/p/");
      getImageURL(expurl.url.substring(28))
    });
}

function sendData (image){
  console.log("Sending data to browser.");
  var update = {
    'image': image
  };
  io.sockets.emit('message', JSON.stringify(update));
};

function getImageURL(uuid) {
  request({
    uri: "http://2instawithlove.com/p/"+uuid
  }, function(error, response, body) {
    var $ = cheerio.load(body);
    $(".photo > img").each(function() {
      var img = $(this);
      console.log(img.attr("src"));
      sendData(img.attr("src"));
    })
  }); 
}
