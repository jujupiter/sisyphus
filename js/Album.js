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
	
};

/**
 * Define the array of Album objects
 * @param {Array} dataArray Data returned by server
 * @return {Array}
 */
Album.defineAlbumList = function(dataArray) {
	var ret = [];
	for(var i=0; i<dataArray.length; i++) {
		ret.push(new Album(dataArray[i]));
	}
	return ret;
};