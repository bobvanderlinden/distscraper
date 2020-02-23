#!/usr/bin/env node
var repl = require('repl');
var fs = require('fs');
var async = require('async');
var path = require('path');
var request = require('./request');
var program = require('commander');
var mkdirp = require('mkdirp');
var validation = require('./validation.js');
var Rx = require('rx');

var scrapers = [];
var mergeFiles = [];
function includeDirectory(directoryPath) {
	fs.readdirSync(directoryPath).map(function(scraperName) {
		return path.join(directoryPath,scraperName);
	}).forEach(includeScraper);
}

function includeScraper(scraperPath) {
	scraperPath = path.resolve('.', scraperPath);
	var scraper = require(scraperPath);
	scraper.path = scraperPath;
	scraper.id = path.basename(scraperPath, '.js');
	scrapers.push(scraper);
}

function mergeFile(mergePath) {
	mergeFiles.push(mergePath);
}

program
	.option('-d, --directory <path>', 'Include directory of scrapers',includeDirectory)
	.option('-s, --scraper <path>', 'Include specific scraper',includeScraper)
	.option('-m, --merge <path>', 'Merge existing results with the scraped results.',mergeFile)
	.parse(process.argv);


if (!program.directory && !program.scraper) {
	includeDirectory(__dirname + '/scrapers');
}

var repositoryDefinitions = [
	{
		name: 'all',
		filter: function(distribution) { return true; }
	},
	{
		name: 'main',
		filter: function(distribution) { return distribution.tags.indexOf('hybrid') >= 0; }
	},
	{
		name: 'syslinux',
		filter: function(distribution) { return distribution.tags.indexOf('nonhybrid') >= 0; }
	}
];

function getRxScraper(scraper) {
	if (typeof scraper === 'function') {
		throw new Error('Invalid scraper', scraper);
	}
	// Rx based distribution
	return Rx.Observable.defer(function() {
		return Rx.Observable.just(scraper);
	});
}

function resolveDistributionReleases(distribution) {
	return distribution.releases.toArray()
		.map(releases => Object.merge(distribution, {
			releases: releases
		}));
}

function loadDistributionsFromFile(path) {
	return Rx.Observable.create(function(observer) {
		var completed = false;
		var StreamArray = require("stream-json/utils/StreamArray");
		var stream = StreamArray.make();

		stream.output.on("data", function(object){
			if (completed) { return; }
			observer.onNext(object.value);
		});
		stream.output.on("end", function(){
			if (completed) { return; }
			observer.onCompleted();
			completed = true;
		});
		stream.input.on('error', function(err) {
			if (completed) { return; }
			console.error(err);
			observer.onCompleted();
			completed = true;
		});

		fs.createReadStream(path)
			.on('error', function(err) {
				console.error('Attempting to load',path,'has failed with error:', err);
				console.error('Skipping ', path);
				observer.onCompleted();
				completed = true;
			})
			.pipe(stream.input);
	});
}

function loadMergeFiles() {
	return Rx.Observable.from(mergeFiles)
		.concatMap(mergeFile => loadDistributionsFromFile(mergeFile))
		.distinct(distribution => distribution.id);
}

function intersperse(observable, separator) {
	var first = true;
	return observable.flatMap(item => {
		if (first) {
			first = false;
			return [item];
		} else {
			return [separator, item];
		}
	});
}

function toJsonArray(objects) {
	return objects
		.map(obj => JSON.stringify(obj))
		.intersperse(',')
		.startWith('[')
		.concat(Rx.Observable.just(']'));
}

function writeJsonArrayToStream(stream, objects) {
	return toJsonArray(objects)
		.doOnNext(str => stream.write(str));
}

function doWriteFile(filePath, objects) {
	return Rx.Observable.using(
		function() {
			// Initialize stream
			var disposableStream = Rx.Disposable.create(function() {
				this.stream.end();
			});
			disposableStream.stream = fs.createWriteStream(filePath);
			return disposableStream;
		}, function(disposableStream) {
			var stream = disposableStream.stream;
			return objects
				.doOnNext(item => {
					stream.write(item)
				});
		});
}

Rx.Observable.prototype.intersperse = function(separator) {
	return intersperse(this, separator);
};

Rx.Observable.prototype.toJsonArray = function() {
	return toJsonArray(this);
};

Rx.Observable.prototype.doWriteFile = function(filePath) {
	return doWriteFile(filePath, this);
};

// 
Rx.Observable.prototype.reduceConcat = function(accumulator, initialState, stateMapper) {
	return this.materialize()
		.scan((acc, notification) => {
			switch(notification.kind) {
				case 'N':
					var item = notification.value;
					return {
						state: accumulator(acc.state, item),
						observable: Rx.Observable.just(item)
					};
				case 'E':
					return {
						state: acc.state,
						observable: Rx.Observable.throw(notification.error)
					};
				case 'C':
					return {
						state: acc.state,
						observable: stateMapper(acc.state)
					};
				default:
					throw new Error();
			}
		}, { state: initialState, observable: Rx.Observable.empty() })
		.concatMap(acc => acc.observable);
};

function writeDistributions(filePath, distributions) {
	return distributions
		.toJsonArray()
		.doWriteFile(filePath);
}

var rxMkdirp = Rx.Observable.fromNodeCallback(mkdirp);


function writeDistributionsToFile(distributions, filePath) {
	return distributions.toJsonArray().doWriteFile(filePath).reduce(_ => true, true);
}

function writeRepositories(distributions) {
	return Rx.Observable.from(repositoryDefinitions)
		.flatMap(repositoryDefinition => distributions
			.filter(repositoryDefinition.filter)
			.toJsonArray()
			.doWriteFile(repositoryDefinition.name + '.json')
		)
		.reduce(_ => true, true);
}

Rx.Observable.from(scrapers)
	.doOnNext(scraper => {
		console.log('Loading', scraper.id,'...');
	})
	.map(scraper => getRxScraper(scraper)
		.catch(err => Rx.Observable.just({
			id: scraper.id,
			error: err,
			releases: Rx.Observable.empty()
		}))
	)
	.merge(4)
	.concatMap(distribution => resolveDistributionReleases(distribution)
		.doOnNext(distribution => {
			if (distribution.error) { return; }
			const errors = validation.validateDistribution(distribution)
			if (errors && errors.length > 0) {
				throw errors
			}
		})
		.catch(err => Rx.Observable.just(Object.merge(distribution, {
			error: err,
			releases: []
		})))
	)
	.doOnNext(distribution => {
		if (distribution.error) {
			console.log('Error    ', distribution.id, distribution.error);
		} else {
			console.log('Resolved ', distribution.id);
		}
	})
	.filter(distribution => !distribution.error)
	.reduceConcat((state, distribution) => {
		return state.concat([distribution.id]);
	}, [], state => {
		// Concat the distributions from mergeFiles that weren't found by the current run.
		return loadMergeFiles()
			.filter(distribution => state.indexOf(distribution.id) === -1);
	})
	.publish(distributions => writeRepositories(distributions))
	.ignoreElements()
	.subscribe(
		result => {},
		err => {
			console.error('Error:', err);
			process.exitCode = 1;
		},
		() => {
			console.log('done');
		}
	);
