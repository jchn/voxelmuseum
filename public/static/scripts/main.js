io = io.connect();

// Emit ready event.
io.emit('ready');

io.on('get-subject', function(data) {
	io.emit('subject', prompt('give me a subject'));
});

io.on('image', function(data){
	if(typeof(data.image.standard_resolution) !== 'undefined')
		$('body').append('<img src="' + data.image.standard_resolution.url + '" alt="data.message" />');
});

io.on('update', function(data){
	console.log(data);
});

io.on('update-found', function(data) {
	console.log(data);
});

// Listen for session event.
io.on('session', function(data) {
	var message = 'subject : ' + data.subject;
  alert(message);
});
