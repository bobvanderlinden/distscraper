var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var sugar = require('sugar');
var cookieJar = request.jar();
var URL = require('url');

var request = request.defaults({
	method: 'GET'
});

var requestQueues = {};
function getRequestQueue(host) {
	host = host.toLowerCase();
	var requestQueue = requestQueues[host];
	if (!requestQueue) {
		requestQueue = requestQueues[host] = async.queue(request,1);
	}
	return requestQueue;
}

function requestBase(options,result) {
	if (typeof options === 'string') {
		options = { url: options };
	}
	var host = URL.parse(options.url).host;
	var q = getRequestQueue(host);
	q.push(options,handleResponse);
	function handleResponse(err,response,body) {
		if (err) {
			err.url = options.url;
			return result(err);
		}
		if (response.statusCode === 302) { // Handle redirects after POST
			requestQueue.pushRequest({url:response.headers.location},handleResponse);
			return;
		}
		response.url = options.url;
		result(null,response,body);
	}
}

function requestText(options,result) {
	requestBase(options,function(err,response,body) {
		if (err) { return result(err); }
		result(null,body);
	});
}

function requestDom(options,result) {
	requestBase(options,function(err,response,body) {
		if (err) { return result(err); }
		var $ = cheerio.load(body);
		result(null,$,response);
	});
}

function requestXmlDom(options,result) {
	requestBase(options,function(err,response,body) {
		if (err) { return result(err); }
		var $ = cheerio.load(body,{xmlMode: true});
		result(null,$,response);
	});
}

function requestContentLength(options,result) {
	if (typeof options === 'string') {
		options = { url: options };
	}
	var newOptions = { method: 'HEAD' };
	Object.merge(newOptions,options);
	requestBase(newOptions,function(err,response) {
		if (err) { return result(err,null,response); }
		if (response.statusCode < 200 || response.statusCode >= 300) { return result(null,null,response); }
		var contentLength = response.headers['content-length'];
		if (contentLength === undefined) {
			result(null,contentLength,response);
		}
		try {
			contentLength = parseInt(contentLength,10);
		} catch(e) {
			result(e,null,response);
		}
		result(null,contentLength,response);
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
module.exports.text = requestText;
module.exports.dom = requestDom;
module.exports.xmldom = requestXmlDom;
module.exports.contentlength = requestContentLength;
