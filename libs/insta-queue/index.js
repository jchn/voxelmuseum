module.exports = function( instagram, opts ) {
	return new Queue( instagram, opts )
}

module.exports.Queue = Queue
//TODO instead of using setTimeout, use the gameloop
function Queue( instagram, opts ) {

	if (!(this instanceof Queue)) return new Queue( instagram, opts );

	this.collection = [];
	this.instagram = instagram;

}

Queue.prototype.push = function( obj ) {
	for( index in this.collection ) {
		if( obj.id === this.collection[index] ) return false;
	}
	return this.collection.push( obj );
}

Queue.prototype.pop = function() {
	return this.collection.pop();
}

Queue.prototype.last = function() {
	return this.collection[this.collection.length-1];
}

Queue.prototype.length = function() {
	return this.collection.length;
}

Queue.prototype.collectMedia = function( type ) {
	var _this = this;
	this.instagram.tags.recent({ 
		name : type,
		complete : function( data, pagination ) {

			for( index in data ) {
				_this.push( data[index] );
			}

		},
		error : function( errorMsg, errorData, caller ) {
			console.log( 'queue encountered an error:' );
			console.log( errorMsg );
		}
	});
}
