/**
 * Determine whether an array contains an item with propertyName equal to propertyValue
 * @param {String} propertyName
 * @param propertyValue
 * @return {Boolean}
 */
Array.prototype.containsItemWith = function(propertyName, propertyValue) {
	for(var i=0; i<this.length; i++) {
		if(this[i].hasOwnProperty(propertyName) && this[i][propertyName]==propertyValue) {
			return true;
		}
	}
	return false;
};

/**
 * Count the number of items with propertyName equal to propertyValue
 * @param {String} propertyName
 * @param propertyValue
 * @return {Number}
 */
Array.prototype.countItemsWith = function(propertyName, propertyValue) {
	var cnt = 0;
	for(var i=0; i<this.length; i++) {
		if(this[i].hasOwnProperty(propertyName) && this[i][propertyName]==propertyValue) {
			cnt++;
		}
	}
	return cnt;
};

/**
 * Determine whether an array for which an item with methodName returning returnedValue
 * @param {String} methodName
 * @param returnedValue
 * @return {Boolean}
 */
Array.prototype.containsItemForWhich = function(methodName, returnedValue) {
	for(var i=0; i<this.length; i++) {
		if(this[i].hasOwnProperty(methodName) && this[i][methodName]()==returnedValue) {
			return true;
		}
	}
	return false;
};


/**
 * Count the number of items for which methodName returns returnedValue
 * @param {String} methodName
 * @param returnedValue
 * @return {Number}
 */
Array.prototype.countItemsForWhich = function(methodName, returnedValue) {
	var cnt = 0;
	for(var i=0; i<this.length; i++) {
		if(this[i].hasOwnProperty(methodName) && this[i][methodName]()==returnedValue) {
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
			console.log();
			this[i][method](callback);
			hasCalled = true;
		}
	}
	if(!hasCalled) {
		callback();
	}
};

Array.prototype.callMethodForAllWhich = function(methodName, returnedValue, method, callback) {
	var hasCalled = false;
	for(var i=0; i<this.length; i++) {
		if(this[i].hasOwnProperty(methodName) && this[i][methodName]()==returnedValue) {
			console.log(this[i]);
			this[i][method](callback);
			hasCalled = true;
		}
	}
	if(!hasCalled) {
		callback();
	}
};

Array.prototype.shuffle = function() {
	var currentIndex = this.length, temporaryValue, randomIndex ;
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// And swap it with the current element.
		temporaryValue = this[currentIndex];
		this[currentIndex] = this[randomIndex];
		this[randomIndex] = temporaryValue;
	}
	return this;
}