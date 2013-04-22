io = io.connect()

// Emit ready event.
io.emit('ready')

io.on('talk', function(data){
	//alert(data.message);
	console.log(data);
});

io.on('image', function(data){
	console.log(data.image.standard_resolution.url);
	if(data.image.standard_resolution) $('body').append('<img src="' + data.image.standard_resolution.url + '" alt="data.message" />');
});
