var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var cookieJar = request.jar();

var request = request.defaults({
	method: 'GET'
});

var q = async.queue(request,2);

function requestBase(options,result) {
	if (typeof options === 'string') {
		options = { url: options };
	}
	q.push(options,handleResponse);
	function handleResponse(err,response,body) {
		if (err) { return result(err); }
		if (response.statusCode === 302) { // Handle redirects after POST
			requestQueue.pushRequest({url:response.headers.location},handleResponse);
			return;
		}
		response.url = options.url;
		result(response,body);
	}
}

function requestDom(options,result) {
	requestBase(options,function(response,body) {
		var $ = cheerio.load(body);
		result(null,$,response);
	});
}

function requestXmlDom(options,result) {
	requestBase(options,function(response,body) {
		var $ = cheerio.load(body,{xmlMode: true});
		result(null,$,response);
	});
}


// Cheerio helpers
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

module.exports = requestBase;
module.exports.dom = requestDom;
module.exports.xmldom = requestXmlDom;