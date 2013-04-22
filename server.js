var settings = require('./settings'),
    connect = require('connect'),
    Instagram = settings.instagram,
    Queue = require('insta-queue')(Instagram),
    app = settings.app;
app.http().io();

// assuming io is the Socket.IO server object
app.io.configure(function () { 
  app.io.set("transports", ["xhr-polling"]); 
  app.io.set("polling duration", 10); 
});

// Send the client html.
app.get('/', function(req, res) {
    res.render('test');
    //console.log( Instagram._config );
    //console.log( 'popular stuff' );
    //console.log( Instagram.media.popular({}) );
    Queue.collectMedia( 'justinbieber' );
})

// Send instagram verification afther their get request
app.get('/subscribe/', function(req, res){
  Instagram.subscriptions.handshake(req, res);
});

// Handle instagram updates
app.post('/subscribe/', function(req, res){
  console.log('new update');
  console.log(req.body);
});

app.get('/unsubscribe/', function(req, res){
  console.log(Instagram.media.unsubscribe_all());
});

// Setup the ready route, and emit talk event.
app.io.route('ready', function(req) {
  function passImage() {
    console.log(Queue.last());
    setTimeout( function(e){
      req.io.emit('image', {
        message: 'new image incoming',
        image: Queue.length() ? Queue.pop().images : {}
      })
      console.log();
      passImage();
    }, 5000 );
  }
  passImage();

})

console.log('server started at port ' + settings.appPort);
app.listen(settings.appPort)
