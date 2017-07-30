var express = require('express');
var app = express();
var path = require('path'); //Use the path to tell where find the .ejs files
// view engine setup
app.set('views', path.join(__dirname, 'views')); // here the .ejs files is in views folders
app.set('view engine', 'ejs'); //tell the template engine


var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) { // route for '/'
  var temp = 50;  //here you assign temp variable with needed value
  var total = temp+10;
  res.render('index', { //render the index.ejs
    temp: temp,
    total:total
  });
});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});