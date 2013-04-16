var http = require('http')
  , path = require('path')
  , connect = require('connect')
  , express = require('express')
  , app = express()
  , Instagram = require('instagram-node-lib')

var cookieParser = express.cookieParser('your secret sauce')
  , sessionStore = new connect.middleware.session.MemoryStore();

app.configure(function () {
  app.set('views', path.resolve('views'));
  app.set('view engine', 'jade');

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(cookieParser);
  app.use(express.session({ store: sessionStore }));
  app.use(app.router);

  // Configure instagram
  Instagram.set('client_id', 'd13bba7c8b7f4d868187995c3dc9c240');
  Instagram.set('client_secret', 'bb49d84b32d94b7ebea146aa2db89806');

  Instagram.set('callback_url', 'http://voxelmuseum.herokuapp.com/subscribe/');

  console.log('app configured');

});

var socket = null;

var server = http.createServer(app)
  , io = require('socket.io').listen(server);

// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10);
  console.log('io configured'); 
});

var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

app.get('/', function(req, res) {
  req.session.foo = req.session.foo || 'bar';
  res.render('index');
});

app.get('/subscribe/', function(req, res){
  console.log(req.query['hub.challenge']);
  var challenge = req.query['hub.challenge'];
  res.send(challenge);
});

app.post('/subscribe/', function(req, res){
  console.log(req.body);
  console.log('____________________');
  res.send(req.body);

  if(socket) socket.emit('subdata', req.body);

});

app.post('/', function(req, res){

  console.log('subscribing');
  console.log(req.body.subto);
  console.log( Instagram.tags.subscribe({ object_id: 'justinbieber' }) );
  res.end('success!');
});

sessionSockets.on('connection', function (err, socket, session) {
  console.log('connected port 5000');
  socket = socket;

  socket.emit('session', session);

  socket.on('foo', function(value) {
    session.foo = value;
    session.save();
    socket.emit('session', session);
  });

  Instagram.media.popular({
    name : 'blue',
    complete : function(data, pagination) {
      console.log(data);
      socket.emit('insta', data);
    },
      error : function(errorMsg, errorObj, caller) {
      console.log(errorMsg);
    }
  });



});
var port = process.env.PORT || 5000;
server.listen(port);
