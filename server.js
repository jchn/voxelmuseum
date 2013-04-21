var settings = require('./settings'),
    connect = require('connect'),
    Instagram = require('instagram-node-lib'),
    app = settings.app;
app.http().io();

// assuming io is the Socket.IO server object
app.io.configure(function () { 
  app.io.set("transports", ["xhr-polling"]); 
  app.io.set("polling duration", 10); 
});

// Configure instagram
Instagram.set('client_id', 'settings.CLIENT_ID');
Instagram.set('client_secret', 'settings.CLIENT_SECRET');

Instagram.set('callback_url', settings.basePath + 'subscribe/');

// Send the client html.
app.get('/', function(req, res) {
    res.render('test');
    //console.log( 'subscribing:' );
    //console.log(Instagram.tags.subscribe({ object_id: 'justinbieber' }));
    console.log( 'client_id : ' + settings.CLIENT_ID );
    console.log( 'client_secrect : ' + settings.CLIENT_SECRET );
    console.log( 'popular stuff' );
    console.log( Instagram.media.popular({}) );
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

console.log('server started at port ' + settings.appPort);
app.listen(settings.appPort)