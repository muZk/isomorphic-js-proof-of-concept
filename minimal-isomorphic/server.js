// BASE SETUP =============================================================================

var express     = require('express');
var bodyParser  = require('body-parser');
var app         = express();
var _           = require('underscore');
var http        = require('http').Server(app);
var serveStatic = require('serve-static');
var port        = process.env.PORT || 8080;

app.set('views', __dirname + '/app/layouts');
app.set('view engine', 'jade');
app.use(serveStatic(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var requireAll = require('require-tree');
requireAll('./app/server');
requireAll('./app/shared');

// ROUTES
// =============================================================================

app.get('/', function(req, res){
  res.render('home/index');
});

http.listen(port, function(){
  console.log('Listening on port:' + port);
});
