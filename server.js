var express = require('express.io'),
    app = express(),
    path = require('path'),
    Instagram = require('instagram-node-lib'),
    Queue = require('./libs/insta-queue')(Instagram);

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
    req.session.subject = req.data;
    req.session.save(function() {
        
      req.io.join( req.session.subject );

      // Check list of subscriptions to check if the subject is already subbed to
      Instagram.subscriptions.list({

        complete : function( data ) {
          console.log('subscriptions');
          console.log(data);

          // Check if req.session.subject already exists
        },
        error : function() {
          console.log( 'something went wrong with the sub list' );
        }

      });

      // Subscribe to the subject
      Instagram.subscriptions.subscribe({ object: 'tag', object_id: req.session.subject });
/*
      Instagram.tags.recent({
          name: req.session.subject,
          complete : function(data, pagination){

            req.io.emit('new-images', data); //send user first batch of data
            console.log( data );

          }
        });
*/
    });
});

// Send instagram verification afther their get request
app.get('/subscribe/', function(req, res){
  Instagram.subscriptions.handshake(req, res);
});

// Handle instagram updates
app.post('/subscribe/', function(req, res){
  console.log('new update');
  console.log(req.body.id);
  //Queue.collectMedia(req.body.id);
  req.io.emit('new-images', req.body);

  // On new data, get the new data and broadcast it to appropriate rooms
});

app.get('/unsub/', function(req, res) {
  Instagram.subscriptions.unsubscribe_all({
    complete : function(data) {
      console.log('unsubbed');
      console.log(data);
    },
    error : function() {
      console.log('an error occured unsubbing');
    }
  });
});

app.listen( process.env.PORT || 5000 );
