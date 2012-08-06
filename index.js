var request = require('request');
var repl = require('repl');
var cheerio = require('cheerio');
var fs = require('fs');

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

cheerio.prototype.filter = function(f) {
	return cheerio(this.toArray().filter(function(e) {
		return f(cheerio(e));
	}));
};

cheerio.prototype.map = function(f) {
	return this.toArray().map(function(e) {
		return f(cheerio(e));
	});
};

cheerio.prototype.mapFilter = function(f) {
	return this.toArray().map(function(e) {
		return f(cheerio(e));
	}).filter(function(e) { return e; });
};

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

function singleline(str) {
	return str.replace(/\s+/g,' ');
}

function multiline(str) {
	return str.replace(/^\s+/,'').replace(/\s+$/,'').replace(/ +/g,' ');
}

var cookieJar = request.jar();

var request = request.defaults({
	method: 'GET'
});

function requestDom(options,result) {
	if (typeof options === 'string') {
		options = { url: options };
	}
	request(options,handleResponse);
	function handleResponse(err,response,body) {
		if (err) { return result(err); }
		if (response.statusCode === 302) { // Handle redirects after POST
			request({url:response.headers.location},handleResponse);
			return;
		}
		makeDom(response,body);
	}
	function makeDom(response,body) {
		var $ = cheerio.load(body);
		result(null,$,response);
	}
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
	var arr = [];
	this.forEach(function(e) {
		arr.concatArray(e);
	});
	return arr;
};

var distributionScrapers = [
	ubuntuScraper,
	opensuseScraper,
	fedoraScraper,
	archlinuxScraper
];

var p = parallel();
var distributions = [];
distributionScrapers.forEach(function(distributionScraper) {
	distributionScraper(p(function(err,distribution) {
		distributions.push(distribution);
	}));
});
p.done(function(err,result) {
	process.stdout.write(JSON.stringify(distributions));
});


function ubuntuScraper(callback) {
	var distributionurl = 'http://releases.ubuntu.com/';
	requestDom(distributionurl,function(err,$) {
		var versions = $('pre a').mapFilter(function(a) { return tryMatch(/^\d+\.\d+/, a.attr('href')); });
		var distribution = {
			name: 'Ubuntu',
			url: 'http://www.ubuntu.com/'
		};

		sequentialForEach(versions,function(version,next) {
			var versionurl = distributionurl+version+'/';
			requestDom(versionurl,p(function(err,$) {
				distribution.releases = $('pre a').mapFilter(function(a) { return tryMatch(/^.*\.iso$/, a.attr('href')); }).map(function(filename) { return {version: version,url:versionurl+filename}; });
				next();
			}));
		},function() {
			callback(null,distribution);
		});
	});
}

function opensuseScraper(callback) {
	var distributionurl = 'http://download.opensuse.org/distribution/';
	requestDom(distributionurl,function(err,$) {
		var versions = $('pre a').mapFilter(function(a) { return tryMatch(/^\d+\.\d+/,a.attr('href')); });
		var distribution = {
			name: 'OpenSUSE',
			url: 'http://www.opensuse.org/',
			releases: []
		};

		sequentialForEach(versions,function(version,next) {
			var isosurl = distributionurl+version+'/iso/';
			requestDom(isosurl,p(function(err,$) {
				distribution.releases.concatArray($('pre a').mapFilter(function(a) { return tryMatch(/^.*\.iso$/, a.attr('href')); }).map(function(filename) { return {version: version,url:isosurl+filename}; }));
				next();
			}));
		},function() {
			callback(null,distribution);
		});
	});
}

function fedoraScraper(callback) {
	var distributionurl = 'http://dl.fedoraproject.org/pub/fedora/linux/releases/';
	requestDom(distributionurl,function(err,$) {
		var versions = $('pre a').mapFilter(function(a) { return tryMatch(/^\d+/,a.attr('href')); });
		var distribution = {
			name: 'Fedora',
			url: 'http://www.fedora.com/',
			releases: []
		};

		function requestISOs(version,isourl,callback) {
			requestDom(isourl,p(function(err,$) {
				if (err) { return callback(err); }
				distribution.releases.push.apply(distribution.releases,$('pre a').mapFilter(function(a) { return tryMatch(/^.*\.iso$/, a.attr('href')); }).map(function(filename) { return {version: version,url:isourl+filename}; }));
				callback();
			}));
		}

		sequentialForEach(versions,function(version,next) {
			var p = parallel();
			requestISOs(version,distributionurl+version+'/Live/i686/',p());
			requestISOs(version,distributionurl+version+'/Live/x86_64/',p());
			requestISOs(version,distributionurl+version+'/Fedora/i386/iso/',p());
			requestISOs(version,distributionurl+version+'/Fedora/x86_64/iso/',p());
			p.done(function() {
				next();
			});
		},function() {
			callback(null,distribution);
		});
	});
}

function archlinuxScraper(callback) {
	var distributionurl = 'http://mirrors.kernel.org/archlinux/iso/';
	requestDom(distributionurl,function(err,$) {
		var versions = $('pre a').mapFilter(function(a) { return tryMatch(/^\d+(\.\d+)*/,a.attr('href')); });
		var distribution = {
			name: 'Arch Linux',
			url: 'http://www.archlinux.org/'
		};

		sequentialForEach(versions,function(version,next) {
			var isosurl = distributionurl+version+'/';
			requestDom(isosurl,p(function(err,$) {
				distribution.releases = $('pre a').mapFilter(function(a) { return tryMatch(/^.*\.iso$/, a.attr('href')); }).map(function(filename) { return {version:version,url:isosurl+filename}; });
				next();
			}));
		},function() {
			callback(null,distribution);
		});
	});
}