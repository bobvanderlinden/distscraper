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
		files.sort();
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

var scrapers = process.argv.slice(2);
async.waterfall([
	scrapers.length === 0 ? getAllScrapers : getScrapers(scrapers),
	loadScrapers,
	scrape
],function(err,distributions) {
	if (err) { console.error(err); }
	console.log(JSON.stringify(distributions.compact()));

	var errors = validateDistributions(distributions);
	if (errors.length > 0) {
		console.error(errors);
		process.exit(1);
	}
});

function validateDistributions(distributions) {
	var errors = [];
	distributions.forEach(function(distro) {
		errors.concat(validateDistribution(distro));
	});
	return errors;
}

function validateDistribution(distro) {
	var errors = [];
	function pushError(description) { errors.push({distribution: distro.id, description: description}); }

	try {
		if (!distro.id) { pushError('No id for distro'); }
		if (!distro.name) { pushError('No name for distro'); }
		if (!distro.url) { pushError('No website for distro'); }
		if (distro.releases.length === 0) {
			pushError('No releases');
		}
		distro.releases.forEach(function(release) {
			if (!release) { pushError('Release is null'); return; }
			if (typeof release !== 'object') { pushError('Release is not an object'); return; }
			if (!release.url) { pushError('Release does not have an url'); }
			if (!release.size) { pushError('Release "'+release.url+'" does not have a size'); }
			if (!release.version) { pushError('Release "'+release.url+'" does not have an version'); }
			if (!/^http:\/\//.test(release.url)) { pushError('Release "'+release.url+'" is not an url'); }
			if (/\s+/.test(release.url)) { pushError('Release "'+release.url+'" has whitespace in its url'); }
			if (distro.releases.filter(function(o) { return o && o.url === release.url; }).length > 1) { pushError('Duplicate url "'+release.url+'".'); }
		});
	} catch (e) {
		pushError('Exception while validating: "' + e + '".');
	}
	return errors;
}


