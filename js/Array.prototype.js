Array.prototype.containsItemWith = function(propertyName, propertyValue) {
	for(var i=0; i<this.length; i++) {
		if(this[i].hasOwnProperty(propertyName) && this[i][propertyName]==propertyValue) {
			return true;
		}
	}
	return false;
};

Array.prototype.countItemsWith = function(propertyName, propertyValue) {
	var cnt = 0;
	for(var i=0; i<this.length; i++) {
		if(this[i].hasOwnProperty(propertyName) && this[i][propertyName]==propertyValue) {
			cnt++;
		}
	}
	return cnt;
};

Array.prototype.getIndexBy = function(propertyName, propertyValue) {
	for(var i=0; i<this.length; i++) {
		if(this[i].hasOwnProperty(propertyName) && this[i][propertyName]==propertyValue) {
			return i;
		}
	}
	return -1;
};

Array.prototype.callMethodForAll = function(propertyName, propertyValue, method, callback) {
	var hasCalled = false;
	for(var i=0; i<this.length; i++) {
		if(this[i].hasOwnProperty(propertyName) && this[i][propertyName]==propertyValue) {
			this[i][method](callback);
			hasCalled = true;
		}
	}
	if(!hasCalled) {
		callback();
	}
};