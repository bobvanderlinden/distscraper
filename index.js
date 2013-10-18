var repl = require('repl');
var fs = require('fs');
var async = require('async');
var path = require('path');
var request = require('./request');
var program = require('commander');

var scrapers = [];

function includeRepository(name) {
	fs.readdirSync(name).map(function(scraperName) {
		return path.join(name,scraperName);
	}).forEach(includeScraper);
}

function includeScraper(name) {
	scrapers.push(require('./' + name));
}

program
	.option('-r, --repository <repository>', 'Include repository',includeRepository)
	.option('-s, --scraper <scraper>', 'Include scraper',includeScraper)
	.parse(process.argv);

function scrape(scrapers,callback) {
	async.map(scrapers,function(scraper,callback) {
		scraper(request,callback);
	},callback);
}

scrape(scrapers, function(err,distributions) {
	if (err) { console.error(err); throw err; }
	process.stdout.write(JSON.stringify(distributions.compact()));

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


