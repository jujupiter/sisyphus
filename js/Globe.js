/**
 * Class Globe
 * Display globe according to parameters
 *
 * Requires d3.js
 */
var Globe = function(selector, diameter, margin, x, y) {

	this.dimensions = {
		diameter: diameter,
		width: diameter,
		height: diameter,
		margin: margin,
		x: x,
		y: y
	};

	this.selector = selector;
	this.projection = d3.geo.orthographic()
		.scale(this.dimensions.diameter/2)
		.translate([this.dimensions.width / 2, this.dimensions.height / 2])
		.clipAngle(90);
	this.canvas =  d3.select(this.selector+' canvas')
		.attr("width", this.dimensions.width)
		.attr("height", this.dimensions.height);
	this.context = this.canvas.node().getContext("2d");
	this.path = d3.geo.path()
		.projection(this.projection)
		.context(this.context);
		
	this.land = null;
	this.locations = [];
	
	/**
	 * Click event listener : the globe reacts to clicks
	 */
	 this.canvas.on('click', function() {
		// First, check what is in "currentlyShown" (to persist if the album thumbnail has gone away too fast)
		if(currentlyShown) {
			currentlyShown.launchAlbum();
			return true;
		}
		// Else, find the location matching the mouse cursor
		else {
			for(var i=0; i<globe.locations.length; i++) {
				if(globe.locations[i].shown && globe.locations[i].matchesPoint(d3.event.offsetX, d3.event.offsetY)) {
					globe.locations[i].launchAlbum();
					return true;
				}
			}
		}
		return false;
	});
	
	/**
	 * Display info if mouse is over location
	 * @param {Boolean} show Instruct to show or hide info of locations
	 * @param {Number} mouseX X coordinate of the mouse on the canvas
	 * @param {Number} mouseY Y coordinate of the mouse on the canvas
	 */
	this.detectMouse = function(show, mouseX, mouseY) {
		var matchesOne = false;
		for(var i=0; i<this.locations.length; i++) {
			if(show && this.locations[i].shown && this.locations[i].matchesPoint(mouseX, mouseY)) {
				matchesOne = true;
				this.canvas.style({cursor:'pointer'});
				this.locations[i].displayInfo();
			}
			else {
				this.locations[i].hideInfo();
			}
		}
		if(!matchesOne) {
			this.canvas.style({cursor:null});
		}
	}.bind(this);
	
	/**
	 * Mouse event listener : the globe reacts to mouse over
	 */
	this.canvas.on('mousemove', function() {
		var coordinates = d3.mouse(this);
		globe.detectMouse(true, coordinates[0], coordinates[1]);
	});
	
	/**
	 * Mouse event listener : the globe reacts to mouse out
	 */
	this.canvas.on('mouseout', function() {
		globe.detectMouse(false);
	});
	

	/**
	 * Define the array of Location objects from locations known by the server
	 * @param {Array} dataArray Data returned by server
	 * @return {Array}
	 */
	this.defineLocationList = function(dataArray) {
		for(var i=0; i<dataArray.length; i++) {
			this.locations.push(new Location(dataArray[i].name, dataArray[i].lat, dataArray[i].lng, dataArray[i].invalid, this));
		}
		this.locations.shuffle();
	};
	
	/**
	 * Remove locations with no albums or invalid
	 */
	this.removeEmptyAndInvalidLocations = function() {
		for(var i=0; i<this.locations.length; i++) {
			if(!this.locations[i].albums.length || this.locations[i].invalid) {
				this.locations.splice(i, 1);
			}
		}
	};
	
	/**
	 * Help determine the distance from the center
	 * @param {Number} lng Longitude
	 * @param {Number} lat Latitude
	 */
	this.getGeoAngle = function(lng, lat) {
		return d3.geo.distance([lng, lat], [-this.projection.rotate()[0], this.projection.rotate()[1]]);
	};
	
	/**
	 * Is the position visible ?
	 * @param {Number} lng Longitude
	 * @param {Number} lat Latitude
	 */
	this.isVisible = function(lng, lat) {
		return (Math.PI/2 - this.getGeoAngle(lng, lat)) > 0;
	};
	
	/**
	 * Trace the globe
	 */
	this.trace = function(t) {
		
		var r = d3.interpolate(this.projection.rotate(), [this.dimensions.x, this.dimensions.y]);
		var c = this.context;
		this.projection.rotate(r(t));
		c.clearRect(0, 0, this.dimensions.width, this.dimensions.height);
		
		// Sea
		c.fillStyle = '#111177';
		c.beginPath();
		c.arc(this.dimensions.width/2, this.dimensions.height/2, this.dimensions.height/2, 0, 2 * Math.PI, false);
		c.fill();
		
		// Land
		c.fillStyle = "#55ee22";
		c.beginPath();
		this.path(this.land);
		c.fill();
		
		// Locations
		// Get the number of currently shown locations and trigger their display function
		var countShown = 0;
		var shownLocations = [];
		var countAllSeen = 0;
		for(var i=0; i<this.locations.length; i++) {
			// This method must always be called first
			this.locations[i].refreshCoordinates();
			if(this.locations[i].shown) {
				this.locations[i].show();
				countShown++;
				shownLocations.push(this.locations[i]);
			}
			if(this.locations[i].allSeen) {
				countAllSeen++;
			}
		}
		// Reset albums if everything has been seen now
		if(countAllSeen==this.locations.length) {
			this.reset();
		}
		// If we have less than 3 locations displayed, find as many as necessary
		for(var i=0; (i<this.locations.length && countShown<3); i++) {
			if(this.locations[i].isSelectable() && !this.locations[i].doesOverlapThese(shownLocations)) {
				this.locations[i].shown = true;
				this.locations[i].show();
				countShown++;
				shownLocations.push(this.locations[i]);
			}
		}
		
		
	}.bind(this);
	
	/**
	 * Reset all albums as unseen
	 */
	this.reset = function() {
		paused = true;
		for(var i=0; i<this.locations.length; i++) {
			this.locations[i].resetAllAlbumsAsUnseen();
			this.locations[i].allSeen = false;
		}
		paused = false;
	}.bind(this);
	
	/**
	 * Rotate the globe
	 */
	this.rotate = function() {
		if(!paused) {
			this.dimensions.x += 1;
			if(this.dimensions.x>360) {
				this.dimensions.x = 0;
			}
		}
		return this.trace;
	}.bind(this);
	
	/**
	 * Display the globe according to 
	 */
	this.display = function() {
		d3.transition()
			.duration(Settings.speed)
			.tween("rotate", this.rotate)
		  .transition()
			.each("end", this.display);
	}.bind(this);
	
};