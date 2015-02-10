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
	
	this.shown = false;
	
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
		return this.globe.isVisible(this.lng, this.lat);
	};
	
	/**
	 * Return coordinates of the top left (starting point) of a thumbnail
	 * @return {Object}
	 */
	this.getTopLeft = function() {
		return {
			x: this.x*Settings.thumbnail.ratio,
			y: this.y
		};
	};
	
	/**
	 * Show location with an album
	 * @param {Object} c Canvas context
	 * @param {Object} globe Globe
	 */
	this.show = function(c, globe) {
		
		// Select an album to show
		this.albumIndex = 0; //Math.floor((Math.random() * this.albums.length));
		
		if(this.isVisible()) {
			
			var thumbSize = Settings.thumbnail.size;
			var thumbBorder = Settings.thumbnail.border;
			
			// Thumbnail
			var coords = globe.projection([this.lng, this.lat]);
			this.x = coords[0];
			this.y = coords[1];
			var ratio = Settings.thumbnail.ratio;
			
			var appliedCoordinates = this.getTopLeft();
			
			c.beginPath();
			c.fillStyle = '#fff';
			c.rect(appliedCoordinates.x, appliedCoordinates.y, Settings.thumbnail.effectiveSize, Settings.thumbnail.effectiveSize);
			c.fill();
			
			if(!this.thumbnail || this.thumbnail.src != this.albums[this.albumIndex].thumbnail) {
				this.thumbnail = new Image();
				this.thumbnail.onload = function() {
					c.drawImage(this, thumbBorder+appliedCoordinates.x, thumbBorder+appliedCoordinates.y, thumbSize, thumbSize);
				};
				this.thumbnail.src = this.albums[this.albumIndex].thumbnail;
			}
			else {
				c.drawImage(this.thumbnail, thumbBorder+appliedCoordinates.x, thumbBorder+appliedCoordinates.y, thumbSize, thumbSize);
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
			
			this.shown = true;
			// Set album properties
			this.albums[this.albumIndex].shown = true;
			this.albums[this.albumIndex].seen = true;
			// Have all albums for this location been seen now ?
			this.allSeen = this.getAllSeenAlbums();
		
		}
		else {
			this.shown = false;
			this.albums[this.albumIndex].shown = false;
		}
		
	};
	
	/**
	 * Location matches click
	 * @param {Number} mouseX
	 * @param {Number} mouseY
	 */
	this.matchesClick = function(mouseX, mouseY) {
		var appliedCoordinates = this.getTopLeft();
		var okX = (mouseX > appliedCoordinates.x && mouseX < (appliedCoordinates.x + Settings.thumbnail.effectiveSize));
		var okY = (mouseY > appliedCoordinates.y && mouseY < (appliedCoordinates.y + Settings.thumbnail.effectiveSize));
		return okX && okY;
	};
	
	/**
	 * Launch select album
	 */
	this.launchAlbum = function() {
		if(this.albumIndex!==null && this.albums[this.albumIndex] && this.albums[this.albumIndex].shown) {
			console.log("hey");
			this.albums[this.albumIndex].launchAlbum();
		}
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