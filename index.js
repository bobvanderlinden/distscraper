var repl = require('repl');
var fs = require('fs');
var async = require('async');
var path = require('path');
var request = require('./request');
var program = require('commander');

var scrapers = [];

function includeDirectory(directoryPath) {
	fs.readdirSync(directoryPath).map(function(scraperName) {
		return path.join(directoryPath,scraperName);
	}).forEach(includeScraper);
}

function includeScraper(scraperPath) {
	scrapers.push(require('./' + scraperPath));
}

program
	.option('-d, --directory <path>', 'Include directory of scrapers',includeDirectory)
	.option('-s, --scraper <path>', 'Include specific scraper',includeScraper)
	.option('-o, --output <outputdir>', 'Output directory','out')
	.parse(process.argv);

if (!program.directory || !program.scraper) {
	includeDirectory('scrapers');
}

var repositoryDefinitions = [
	{
		name: 'main',
		filter: function(distribution) { return distribution.tags.indexOf('hybrid') >= 0; }
	},
	{
		name: 'nonhybrid',
		filter: function(distribution) { return distribution.tags.indexOf('nonhybrid') >= 0; }
	}
];

function scrape(scrapers,callback) {
	async.map(scrapers,function(scraper,callback) {
		scraper(request,callback);
	},callback);
}

scrape(scrapers, function(err,distributions) {
	if (err) { console.error(err); throw err; }

	var errors = validateDistributions(distributions);
	if (errors.length > 0) {
		console.error(errors);
		process.exit(1);
		return;
	}

	var repositories = repositoryDefinitions.map(function(repositoryDefinition) {
		return {
			name: repositoryDefinition.name,
			distributions: distributions.filter(repositoryDefinition.filter.bind(repositoryDefinition))
		};
	});

	async.forEach(repositories, function(repository,cb) {
		var repositoryPath = path.join(program.output, repository.name + '.json');
		fs.writeFile(repositoryPath, JSON.stringify(repository.distributions), cb);
	},function(err) {
		if (err) {
			console.error(err);
			process.exit(1);
			return;
		}
		process.exit(0);
	});
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


