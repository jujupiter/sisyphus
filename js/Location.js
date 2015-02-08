/**
 * Class Location
 *
 * Requires d3.js
 *
 * @constructor
 * @param {Object} data
 */
var Location = function(name, lat, lng, known, invalid, globe) {

	this.name = name;
	this.lat = lat;
	this.lng = lng;
	this.x = null;
	this.y = null;
	
	this.globe = globe;
	
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
	this.thumbnail = null;
	
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
		d3.json("location.php?action=add&name="+this.name+"&lng="+this.tLng+"&lat="+this.tLat, function() {});
		
		this.callback();
		this.callback = null;
		
	};
	
	/**
	 * Is the location currently visible on the globe ?
	 * @return {Boolean}
	 */
	this.isVisible = function() {
		return this.globe.isVisible(this.lng);
	};
	
	/**
	 * Show location with an album
	 * @param {Object} c Canvas context
	 * @param {Object} globe Globe
	 */
	this.show = function(c, globe) {
		
		if(this.isVisible()) {
		
			// Select an album to show
			this.albumIndex = 0; //Math.floor((Math.random() * this.albums.length));
			
			// Thumbnail
			var coords = globe.projection([this.lng, this.lat]);
			this.x = coords[0];
			this.y = coords[1];
			var ratio = 1 - (32/globe.dimensions.width); // Slide the thumbnail around the dot
			
			if(!this.thumbnail || this.thumbnail.src != this.albums[this.albumIndex].thumbnail) {
				this.thumbnail = new Image();
				this.thumbnail.onload = function() {
					c.drawImage(this, this.x*ratio, this.y, 32, 32);
				};
				this.thumbnail.src = this.albums[this.albumIndex].thumbnail;
			}
			else {
				c.drawImage(this.thumbnail, this.x*ratio, this.y, 32, 32);
			}
			
			// Display the dot
			c.fillStyle = '#fff';
			c.beginPath();
			var city = {
				type: "Feature",
				properties: {},
				geometry : {
				  "type": "Point",
				  "coordinates": [this.lng, this.lat]
				}
			};
			globe.path(city);
			c.fill();
			
			// Set album properties
			this.albums[this.albumIndex].visible = true;
			this.albums[this.albumIndex].seen = true;
			// Have all albums for this location been seen now ?
			this.allSeen = this.getAllSeenAlbums();
		
		}
		
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
 * Compute the distance between two locations
 * @param {Location} loc1
 * @param {Location} loc2
 * @return {Number}
 */
Location.getDistance = function(loc1, loc2) {
	// TODO
};