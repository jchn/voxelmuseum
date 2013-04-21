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
})

// Send instagram verification afther their get request
app.get('/subscribe/', function(req, res){
  console.log(req.query['hub.challenge']);
  var challenge = req.query['hub.challenge'];
  res.send(challenge);
});

app.get('/unsubscribe/', function(req, res){
  console.log(Instagram.media.unsubscribe_all());
});

console.log('server started at port ' + settings.appPort);
app.listen(settings.appPort)