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
	 * Is the location selectable to be displayed ?
	 */
	this.isSelectable = function() {
		return this.isVisible() && (this.x < this.globe.dimensions.diameter/2) && !this.shown && !this.allSeen;
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
			x: Math.round(this.x*Settings.thumbnail.ratio),
			y: Math.round(this.y)
		};
	};
	
	/**
	 * Return a possible index for an album with a recursive function
	 */
	this.selectRandomUnseenAlbum = function() {
		var index = Math.floor((Math.random() * this.albums.length));
		if(this.albums[index].seen) {
			return this.selectRandomUnseenAlbum();
		}
		else {
			return index;
		}
	};
	
	/**
	 * Refresh location coordinates
	 */
	this.refreshCoordinates = function() {
		var coords = this.globe.projection([this.lng, this.lat]);
		this.x = coords[0];
		this.y = coords[1];
	};
	
	/**
	 * Show location with an album
	 */
	this.show = function() {
		
		if(this.isVisible()) {
			
			// Have all albums for this location been seen now ?
			this.allSeen = this.getAllSeenAlbums();
		
			// Select an album to show if there isn't any yet
			// To avoid infinite loops, make sure they haven't all been seen yet
			if(null===this.albumIndex && !this.allSeen) {
				this.albumIndex = this.selectRandomUnseenAlbum();
			}
			
			// Then and only then can we show the location
			if(null!==this.albumIndex) {
				
				console.log(this.x, this.y);
			
				var c = this.globe.context;
				var thumbSize = Settings.thumbnail.size;
				var thumbBorder = Settings.thumbnail.border;
				
				// Thumbnail
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
				this.globe.path(city);
				c.fill();
				
				// Display album info ?
				var selection = d3.select('div#poster');
				if(this.albumInfoShown) {
					selection.style({display:'block'});
					selection.select('div#locationName').text(this.name);
					selection.select('div#albumTitle').text(this.albums[this.albumIndex].title);
				}
				else {
					if(selection.select('div#locationName').text()==this.name) {
						selection.style({display:'none'});
					}
				}
				
				// Set object properties
				this.shown = true;
				this.albums[this.albumIndex].seen = true;
				
				// Send success
				return true;
				
			}
		
		}
		
		// Specify there is nothing displayed here
		this.shown = false;
		this.albumIndex = null;
		
		// Send failure
		return false;
		
	};
	
	/**
	 * Location matches point
	 * @param {Number} mouseX
	 * @param {Number} mouseY
	 */
	this.matchesPoint = function(mouseX, mouseY) {
		var appliedCoordinates = this.getTopLeft();
		var okX = (mouseX > appliedCoordinates.x && mouseX < (appliedCoordinates.x + Settings.thumbnail.effectiveSize));
		var okY = (mouseY > appliedCoordinates.y && mouseY < (appliedCoordinates.y + Settings.thumbnail.effectiveSize));
		return okX && okY;
	};
	
	/**
	 * Display the album info
	 */
	this.displayInfo = function() {
		this.albumInfoShown = true;
		currentlyShown = this.albums[this.albumIndex];
	};
	
	/**
	 * Hide the album info
	 */
	this.hideInfo = function() {
		this.albumInfoShown = false;
	};
	
	/**
	 * Launch select album
	 */
	this.launchAlbum = function() {
		if(this.albumIndex!==null && this.albums[this.albumIndex] && this.albums[this.albumIndex].shown) {
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

	/**
	 * Determine whether this location overlaps another
	 * @param {Location} otherLocation Location to compare with
	 * @return {Boolean}
	 */
	this.doesOverlap = function(otherLocation) {
		var otherMinY = otherLocation.y;
		var otherMaxY = otherLocation.y + Settings.thumbnail.effectiveSize;
		return (this.y >= otherMinY && this.y <= otherMaxY);
	};

	/**
	 * Determine whether this location overlaps with any of the other mentioned locations
	 * @param {Array} otherLocations Locations to compare with
	 * @return {Boolean}
	 */
	this.doesOverlapThese = function(otherLocations) {
		for(var i=0; i<otherLocations.length; i++) {
			if(this.doesOverlap(otherLocations[i])) {
				console.log(this.name+' overlaps '+otherLocations[i].name);
				return true;
			}
		}
		return false;
	};

};