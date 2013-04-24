module.exports = function( instagram, app, tag, opts ) {
	return new Queue( instagram, app, tag, opts );
};

module.exports.Queue = Queue;
//TODO instead of using setTimeout, use the gameloop
function Queue( instagram, app, tag, opts ) {

	if (!(this instanceof Queue)) return new Queue( instagram, app, tag, opts );
	console.log('initializing new queue');
	this.collection = [];
	this.app = app;
	this.instagram = instagram;
	this.tag = tag;
	this.max_id = 0;

	console.log('tag : ');
	console.log(tag);

	// Configure instagram
	this.instagram.set('client_id', 'd13bba7c8b7f4d868187995c3dc9c240');
	this.instagram.set('client_secret', 'bb49d84b32d94b7ebea146aa2db89806');

	this.instagram.set('callback_url', 'http://voxelmuseum.herokuapp.com/' + 'subscribe/');

	var _this = this;

	// Subscribe to the subject
	this.instagram.subscriptions.subscribe({
		object: 'tag',
		object_id: _this.tag,
		complete : function(data) {
			// Collect some popular media
			_this.collectPopularMedia();
		},
		error : function(errorMessage, errorObject, caller) {
			console.log('an error occured while subscribing');
			console.log(errorMessage);
			console.log(errorObject);
			console.log(caller);
			console.log(tag);
		}
	});

}

Queue.prototype.push = function( obj ) {
	for( var index in this.collection ) {
		if( obj.id === this.collection[index].id ) return false;
	}
	return this.collection.push( obj );
};

Queue.prototype.pop = function() {
	//return this.collection.pop();
	// Remove 1 item at the beginning -> cleaning
	if(this.collection.length > 1)
		this.collection.splice(0, 1);
	return this.collection[this.collection.length-1];
};

Queue.prototype.last = function() {
	return this.collection[this.collection.length-1];
};

Queue.prototype.length = function() {
	return this.collection.length;
};

Queue.prototype.collectMedia = function( max_id, type ) {
	console.log('collectmedia');
	var _this = this;
	var tag = type || this.tag;
	var max = max_id || this.max_id;
	this.instagram.tags.recent({
		name : tag,
		max_id : max_id,
		complete : function( data, pagination ) {

			for( var index in data ) {
				_this.push( data[index] );
			}

			// Set max_id based on pagination
			//this.max_id = pagination;
			console.log( pagination );
			_this.max_id = pagination.next_max_tag_id;

			_this.broadcast();

		},
		error : function( errorMsg, errorData, caller ) {
			console.log( 'queue encountered an error:' );
			console.log( errorMsg );
		}
	});
};

Queue.prototype.collectPopularMedia = function() {
	console.log('collectPopularMedia');
	var _this = this;
	this.instagram.media.popular({
		complete : function( data ) {
			console.log(data);
			for( var index in data ) {
				_this.push( data[index] );
			}

			console.log( 'broadcasting from popular media' );
			_this.broadcast();

		},
		error : function( errorMsg, errorData, caller ) {
			console.log('something went wrong collecting popular media for tag :' + _this.tag);
			console.log( errorMsg );
			console.log( errorData );
			console.log( caller );
		}
	});
};

Queue.prototype.broadcast = function( fallback ) {
	console.log('broadcast');
	var _this = this;
	if( this.length() > 0 )
		this.app.io.room(this.tag).broadcast('update', _this.pop());
	else if( fallback )
		_this.collectPopularMedia();
};

Queue.prototype.unsub = function() {
	var _this = this;
	this.instagram.subscriptions.unsubscribe({
		id : this.tag,
		complete : function(data) {
			console.log( 'unsubbed for : ' + _this.tag );
			console.log(data);
		},
		error : function( errorMsg, errorData, caller ) {
			console.log('something went wrong unsubbing : ' + _this.tag);
			console.log(errorMsg);
			console.log(errorData);
			console.log(caller);
		}
	});
};
