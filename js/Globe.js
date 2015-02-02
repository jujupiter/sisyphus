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
	this.canvas =  d3.select(this.selector).append("canvas")
		.attr("width", this.dimensions.width)
		.attr("height", this.dimensions.height);
	this.context = this.canvas.node().getContext("2d");
	this.path = d3.geo.path()
		.projection(this.projection)
		.context(this.context);
		
	this.land = null;
	this.locations = null;
	
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
	};
	
	/**
	 * Rotate the globe
	 */
	this.rotate = function() {
		console.log('rotate', paused, this.dimensions);
		if(!paused) {
			this.dimensions.x += 1;
			if(this.dimensions.x>360) {
				this.dimensions.x = 0;
			}
			return this.trace.bind(this);
		}
	};
	
	this.bindedRotate = this.rotate.bind(this);
	
	/**
	 * Display the globe according to 
	 */
	this.display = function() {
		console.log('display', this.rotate, this.display);
		d3.transition()
			.duration(30)
			.tween("rotate", this.bindedRotate)
		  .transition()
			.each("end", this.bindedDisplay);
	};
	
	this.bindedDisplay = this.display.bind(this);
	
};