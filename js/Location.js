/**
 * Class Location
 *
 * Requires d3.js
 *
 * @constructor
 * @param {Object} data
 */
var Location = function(name, lat, lng, known, invalid) {

	this.name = name;
	this.lat = lat;
	this.lng = lng;
	
	this.known = known;
	if(known) {
		this.invalid = invalid;
	}
	else {
		this.invalid = null;
	}
	
	this.visible = false;
	
	this.albums = [];
	this.albumIndex = null;
	
	/**
	 * Request coordinates for location from Google
	 */
	this.requestCoordinates = function(callback) {
		this.callback = callback;
		d3.json("http://maps.google.com/maps/api/geocode/json?address="+this.name, this.handleCoordinatesResponse.bind(this));
	};
	
	/**
	 * Handle response for coordinates from Google
	 * @param {Object} error
	 * @param {Object} results
	 */
	this.handleCoordinatesResponse = function(error, results) {
		
		// Declare as invalid but don't record result
		if(error) {
			this.known = true;
			this.invalid = true;
			return;
		}
		
		// At least one result has been found
		if(results.results.length>0) {
			this.tLng = results.results[0].geometry.location.lng;
			this.tLat = results.results[0].geometry.location.lat;
			this.known = true;
			this.invalid = false;
		}
		// No match found, location is regarded as invalid
		else {
			this.tLng = null;
			this.tLat = null;
			this.known = true;
			this.invalid = true;
		}
		// Save result into local database
		d3.json("location.php?action=add&name="+this.name+"&lat="+this.tLng+"&lng="+this.tLat, function() {});
		
		this.callback();
		this.callback = null;
		
	};
	
	/**
	 * Show location with an album
	 * TODO
	 */
	this.show = function() {
		// Select an album to show
		
		// Display
		
		// Set album properties
		this.albums[this.albumIndex].visible = true;
		this.albums[this.albumIndex].seen = true;
		// Have all albums for this location been seen now ?
		this.allSeen = this.getAllSeenAlbums();
	};
	
	/**
	 * Hide location
	 * TODO
	 */
	this.hide = function() {
		// Hide
		this.albums[this.albumIndex].visible = false;
	};
	
	/**
	 * Determine whether all albums have been seen or not
	 */
	this.getAllSeenAlbums = function() {
		for(var i=0; i<this.albums.length; i++) {
			if(!this.albums[i].seen) {
				return false;
			}
		}
		return true;
	};
	
	/**
	 * Reset all albums as unseen
	 */
	this.resetAllAlbumsAsUnseen = function() {
		for(var i=0; i<this.albums.length; i++) {
			this.albums[i].seen = false;
		}
	};

};

/**
 * Define the array of Location objects from locations known by the server
 * @param {Array} dataArray Data returned by server
 * @return {Array}
 */
Location.defineLocationList = function(dataArray) {
	var ret = [];
	for(var i=0; i<dataArray.length; i++) {
		ret.push(new Location(dataArray[i].name, dataArray[i].lat, dataArray[i].lng, true, dataArray[i].invalid));
	}
	return ret;
};

/**
 * Compute the distance between two locations
 * @param {Location} loc1
 * @param {Location} loc2
 * @return {Number}
 */
Location.getDistance = function(loc1, loc2) {
	// TODO
};