var express = require('express.io'),
    app = express(),
    path = require('path'),
    Instagram = require('instagram-node-lib'),
    Queue = require('./libs/insta-queue'),
    queues = {};

app.http().io();

app.configure(function(){
  app.set('views', path.resolve('views'));
  app.set('view engine', 'jade');

  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.static(__dirname + '/public/'));

  app.use(express.cookieParser());
  app.use(express.session({secret: 'express.io makes me happy'}));

  // Configure instagram
  Instagram.set('client_id', 'd13bba7c8b7f4d868187995c3dc9c240');
  Instagram.set('client_secret', 'bb49d84b32d94b7ebea146aa2db89806');

  Instagram.set('callback_url', 'http://voxelmuseum.herokuapp.com/' + 'subscribe/');

  // assuming io is the Socket.IO server object
  app.io.configure(function () {
    app.io.set("transports", ["xhr-polling"]);
    app.io.set("polling duration", 10);
  });

});

app.all('/', function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/', function(req, res){
  req.session.loginDate = new Date().toString();
  res.render('test');
});

// Setup a route for the ready event, and add session data.
app.io.route('ready', function(req) {

  //session already active
  if(req.session.name) return;

  req.session.name = req.data;
  req.session.save(function() {
      req.io.emit('get-subject');
  });

});

// Send back the session data.
app.io.route('subject', function(req) {
    var _this = this;
    req.session.subject = req.data;
    req.session.save(function() {

      var subject = req.session.subject;

      req.io.join( req.session.subject );

      // Check list of subscriptions to check if the subject is already subbed to
      Instagram.subscriptions.list({

        complete : function( data ) {

          // Check if req.session.subject already exists
          for( var index in data ) {
            var sub = data[index];
            if( sub.object_id === req.session.subject ) return;
          }

          // Create a new Queue with the subject
          queues[req.session.subject] = new Queue( Instagram, app, req.session.subject );

        },
        error : function(errorMessage, errorObject, caller) {
          console.log( 'something went wrong with the sub list' );
          console.log(errorMessage);
        }

      });

    });
});

// Send instagram verification afther their get request
app.get('/subscribe/', function(req, res){
  Instagram.subscriptions.handshake(req, res);
});

// Handle instagram updates
app.post('/subscribe/', function(req, res){
  console.log('new update, should now show tag name');

  for( var index in req.body ) {

    console.log( req.body[index].object_id );

    var tag = req.body[index].object_id;

    queues[tag].collectMedia();

  }

  res.send('OK');

});

app.get('/unsub/', function(req, res) {
  for( var key in queues ) {
    console.log('unsubbing:');
    console.log(queue);
    var queue = queues[key];
    queue.unsub();
  }

  res.send('unsubbed');
});

app.get('/subs/', function(req, res) {

  Instagram.subscriptions.list({
    complete : function(data) {
      var tags = [];
      for( var index in data ) {
        var sub = data[index];
        tags.push( sub.object_id );
      }
      res.render('subs', { tags:tags });
    },
    error : function() {
      console.log( 'something went wrong getting the sub list' );
      res.render('error');
    }
  });

});

app.listen( process.env.PORT || 5000 );
