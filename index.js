var repl = require('repl');
var fs = require('fs');
var async = require('async');
var path = require('path');
function debug() {
	//console.log.apply(console,arguments);
}

function parallel() {
	var pending = 0;
	var errors = [];
	var results = [];
	var hasError = false;
	var callback = null;
	function create(innercallback) {
		var myindex = pending;
		errors.push(undefined);
		results.push(undefined);
		pending++;
		return function(err,result) {
			if (innercallback) {
				innercallback(err,result);
			}
			if (err) { hasError = true; }
			errors[myindex] = err;
			results[myindex] = result;
			pending--;
			if (pending === 0) {
				done();
			}
		};
	}
	function done() {
		if (!hasError) {
			errors = null;
		} else {
			errors = errors.filter(function(error) { return !!error; });
		}
		callback(errors,results);
	}
	create.done = function(cb) {
		callback = cb;
		if (pending === 0) {
			done();
		}
	};
	return create;
}

function tryMatch(regexp,str) {
	return (regexp.exec(str) || [])[0];
}

function filter_empty(e) { return e && e.length > 0; }

function assertNoError(err) {
	if (err) { onError(err); }
}

function onError(err) {
	console.error('Error:',err);
	console.error(new Error().stack);
	process.exit(1);
}

function startRepl(c) {
	var r = repl.start({});
	r.context = c;
}

function sequential(arrayoffunctions,callback) {
	function next() {
		var f = arrayoffunctions.shift();
		if (f) {
			f(fcallback);
		} else if (callback) {
			callback();
		}
	}
	function fcallback(err/*,...*/) {
		if (err) { return callback(err); }
		next();
	}
	next();
}

function sequentialForEach(arr,itercallback,donecallback) {
	function next() {
		var arg = arr.shift();
		if (arg) {
			itercallback(arg,next);
		} else {
			donecallback();
		}
	}
	next();
}

function intersection(arrA,arrB) {
	return arrA.filter(function(b) {
		return arrB.indexOf(b) >= 0;
	});
}

Array.prototype.concatArray = function(arr) {
	Array.prototype.push.apply(this,arr);
	return this;
};

Array.prototype.flatten = function() {
	return this.reduce(function(a,b) {
		return a.concat(b);
	});
};

function getAllScrapers(callback) {
	var scrapersPath = path.join(__dirname,'scrapers');
	fs.readdir(scrapersPath,function(err,files) {
		if (err) { return callback(err); }
		files = files.map(function(file) { return path.join(scrapersPath,file); });
		callback(null,files);
	});
}

function getScrapers(scrapers) {
	var scrapersPath = path.join(__dirname,'scrapers');
	var scraperPaths = scrapers.map(function(file) { return path.join(scrapersPath,file); });
	return function(callback) {
		callback(null,scraperPaths);
	};
}

function loadScrapers(scrapers,callback) {
	var scrapers = scrapers.map(function(scraperName) { return require(scraperName); });
	callback(null,scrapers);
}

function scrape(scrapers,callback) {
	async.map(scrapers,function(scraper,callback) {
		scraper(callback);
	},callback);
}

async.waterfall([
	getAllScrapers,
	loadScrapers,
	scrape
],function(err,distributions) {
	console.log(JSON.stringify(distributions));
});
