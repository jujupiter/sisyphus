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
	
	this.visible = false;
	this.seen = false;
	
};