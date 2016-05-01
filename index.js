var repl = require('repl');
var fs = require('fs');
var async = require('async');
var path = require('path');
var request = require('./request');
var program = require('commander');
var mkdirp = require('mkdirp');
var validation = require('./validation.js');
var Rx = require('rx');

Rx.config.longStackSupport = true;

var scrapers = [];

function includeDirectory(directoryPath) {
	fs.readdirSync(directoryPath).map(function(scraperName) {
		return path.join(directoryPath,scraperName);
	}).forEach(includeScraper);
}

function includeScraper(scraperPath) {
	var scraper = require('./' + scraperPath);
	scraper.path = scraperPath;
	scrapers.push(scraper);
}

program
	.option('-d, --directory <path>', 'Include directory of scrapers',includeDirectory)
	.option('-s, --scraper <path>', 'Include specific scraper',includeScraper)
	.option('-o, --output <outputdir>', 'Output directory','out')
	.option('-n, --nonhuman', 'Don\'t show the status of scrapers interactively')
	.parse(process.argv);


var charm;
// Enable charm is there is an TTY
if (process.stdout.isTTY && !program.nonhuman) {
	charm = require('charm')();
	charm.pipe(process.stdout);
	charm.reset();
} else {
	charm = null;
}

if (!program.directory && !program.scraper) {
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

var statusOffset = 0;

function showScrapers(scrapers) {
	var i;
	if (charm) {
		statusOffset = 0;
		for(i=0;i<scrapers.length;i++) {
			scrapers[i].index = i;
			charm.push();
			charm.write(scrapers[i].path);
			charm.pop();
			charm.down(1);
			statusOffset = Math.max(statusOffset, scrapers[i].path.length);
		}
	} else {
		for(i=0;i<scrapers.length;i++) {
			showScraperStatus(scrapers[i],'starting');
		}
	}
}

function showScraperStatus(scraper,status) {
	if (charm) {
		charm.push();
		charm.up(scrapers.length-scraper.index);
		charm.right(statusOffset+1);
		charm.erase('end');
		charm.write(status);
		charm.pop();
	} else {
		console.log(scraper.path,':',status);
	}
}

var scraperQueue = async.queue(runScraper,2);

function runScraper(scraper,callback) {
	showScraperStatus(scraper,'working');
	scraper(request,function(err,distribution) {
		if (err) { return callback(err,distribution); }
		var errors = validation.validateDistribution(distribution);
		if (errors.length > 0) {
			return callback(errors,distribution);
		}
		return callback(null,distribution);
	});
}

function queueScraper(scraper,callback) {
	return scraperQueue.push(scraper,callback);
}

function queueScrapers(scrapers,callback) {
	showScrapers(scrapers);
	async.map(scrapers,function(scraper,callback) {
		showScraperStatus(scraper,'queued');
		queueScraper(scraper,function(err,distribution) {
			if (err) {
				showScraperStatus(scraper,'error ('+JSON.stringify(err)+')');
				return callback(err,distribution);
			}
			showScraperStatus(scraper,'done ('+distribution.releases.length+' releases)');
			return callback(null,distribution);
		});
	},callback);
}

queueScrapers(scrapers, function(err,distributions) {
	if (err) { console.error(err); throw err; }

	var repositories = repositoryDefinitions.map(function(repositoryDefinition) {
		return {
			name: repositoryDefinition.name,
			distributions: distributions.filter(repositoryDefinition.filter.bind(repositoryDefinition))
		};
	});

	mkdirp(program.output,function() {
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
});
