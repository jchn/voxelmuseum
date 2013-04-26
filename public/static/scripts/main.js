io = io.connect();

var tempRoad;
var firstTime = true;
var ready = true;

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
	//$('body').append('<img src="' + data.images.standard_resolution.url + '" alt="data.message" />');
	if(firstTime) {
		tempRoad = createRoad( game, builder, '/proxy/?url=' + data.images.standard_resolution );
		tempRoad.connect([ new game.THREE.Vector3(0, 1, 7), new game.THREE.Vector3(-5, 1, 7) ]);
		firstTime = false;
		ready = false;
		tempRoad.on('complete', function(structure) {
			ready = true;
		});
	} else if( ready ){
		var prevRoad = tempRoad;
		tempRoad = createRoad( game, builder, '/proxy/?url=' + data.images.standard_resolution.url );
		tempRoad.connect( prevRoad.getLiveConnectionPoints()[1].reverse() );
	} else {
		console.log('update ignored: not ready');
	}

});

io.on('update-found', function(data) {
	console.log(data);
});

// Listen for session event.
io.on('session', function(data) {
	var message = 'subject : ' + data.subject;
  alert(message);
});
