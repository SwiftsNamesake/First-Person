/*
 * Utilities.js
 * Assorted functional goodness
 *
 * Jonatan H. Sundqvist
 * March 26 2014
 *

 * TODO | - Wrap in 'namespace object' (?)
 *        - 

 * SPEC | -
 *        -
 *
 */



/* Mathematical constants */
var π = Math.PI;
var e = Math.E;


/* Mathematical functions */
function rad(degrees) {
	/* Converts degrees to radians */
	return degrees*π/180.0
}


/* I'm so glad I encountered Haskell */
function comprehension(list, functor, predicate) {
	
	var r = []; // Result
	var p = predicate !== undefined ? predicate : function(x) { return true; };
	
	for (var i = 0; i < list.length; i++) {
		if (p(list[i])) {
			r.push(functor(list[i]));
		} else {
			continue;
		}
	};

	return r;

}


/* Array operations */
Array.prototype.comprehension = function(functor, predicate) {
	
	var r = []; // Result
	console.log(predicate, predicate !== undefined);
	var p = predicate !== undefined ? predicate : function(x) { return true; };

	for (var i = 0; i < list.length; i++) {
		if (p(this[i]))
			r.push(functor(list[i]));
		else
			continue;
	};

	return r;

}


Array.prototype.replicate = function(n) {
	var result = [];
	for (var i = 0; i < n; i++) {
		result = result.concat(this);
	}
	return result;
}


Array.prototype.shuffle = function() {
	// From StackOverflow
	var i = this.length, j, temp;
	if (i == 0) return this;
	while (--i) {
		j = Math.floor(Math.random() * (i + 1));
		temp = this[i];
		this[i] = this[j];
		this[j] = temp;
	}
	return this;
}


Array.prototype.chooseRandom = function () {
	// Selects and returns a random element
	return this[Math.floor(Math.random()*this.length)];
}


Array.prototype.flatten = function() {
	// Flattens a 2D array (non-recursively)
	return [].concat.apply([], this);
};


/* String operations */
String.prototype.shuffle = function() {
	return (this.split("").shuffle().join(""));
};



/*  */
function range(start, stop, step) {

	var self = {};

	var start = stop ? start : 0;
	var stop  = stop ? stop  : 0;
	var step  = step ? step  : 1;

	self.map = function(f) { for (var i = start; i < stop; i+=step) { return f(i); } };

	return self;

}