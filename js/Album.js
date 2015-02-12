/**
 * Class Album
 *
 * Requires d3.js
 *
 * @constructor
 * @param {Object} data
 */
var Album = function(data) {
	
	this.link = data.link[1].href;
	this.thumbnail = data.media$group.media$thumbnail[0].url;
	this.title = data.title.$t;
	
	this.seen = false;
	
	this.anchor = d3.select("body").append("a")
		.attr("href", this.link)
		.attr("target", "_blank");
		
	this.launchAlbum = function() {
		if(this.anchor[0][0]) {
			this.anchor[0][0].click();
		}
	}.bind(this);
	
};