var express = require('express.io'),
		app = express(),
		path = require('path'),
    Instagram = require('instagram-node-lib');
exports.app = app;

exports.appPort = process.env.PORT || 5000;
exports.CLIENT_ID = 'd13bba7c8b7f4d868187995c3dc9c240';
exports.CLIENT_SECRET = 'bb49d84b32d94b7ebea146aa2db89806';
exports.httpClient = require('http');
exports.apiHost = 'api.instagram.com';
exports.basePath = 'http://voxelmuseum.herokuapp.com/';
exports.instagram = Instagram;

app.configure(function(){
  app.set('views', path.resolve('views'));
  app.set('view engine', 'jade');

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public/'));

  app.use(express.session({secret: 'express.io makes me happy'}));

  // Configure instagram
  Instagram.set('client_id', 'd13bba7c8b7f4d868187995c3dc9c240');
  Instagram.set('client_secret', 'bb49d84b32d94b7ebea146aa2db89806');

  Instagram.set('callback_url', 'http://voxelmuseum.herokuapp.com/' + 'subscribe/');

});
