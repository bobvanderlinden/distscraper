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

program
	.option('-d, --directory <path>', 'Include directory of scrapers',includeDirectory)
	.option('-s, --scraper <path>', 'Include specific scraper',includeScraper)
	.option('-o, --output <outputdir>', 'Output directory','out')
	.parse(process.argv);


if (!program.directory && !program.scraper) {
	includeDirectory(__dirname + '/scrapers');
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

function getRxScraper(scraper) {
	if (typeof scraper === 'function') {
		var rxScraper = Rx.Observable.fromNodeCallback(scraper);

		// Callback-based distribution
		return Rx.Observable.defer(function() {
			return rxScraper(request)
				.map(distribution => Object.merge(distribution, {
					releases: Rx.Observable.from(distribution.releases)
				}));
		});
	} else {
		// Rx based distribution
		return Rx.Observable.defer(function() {
			return Rx.Observable.just(scraper);
		});
	}
}

function getDistributionFilePath(distribution) {
	return 'scraper.' + distribution.id + '.json';
}

function persistDistribution(distribution) {
	return distribution.releases.toArray()
		.map(releases => Object.merge(distribution, {
			releases: releases
		}))
		.flatMap(distribution => {
			var jsonData = JSON.stringify(distribution);
			var filePath = getDistributionFilePath(distribution);
			return Rx.Observable.fromNodeCallback(fs.writeFile)(filePath, jsonData)
				.map(_ => ({
					id: distribution.id,
					status: 'ok',
					path: filePath,
					result: distribution
				}));
		})
		.catch(err => Rx.Observable.just({
			id: distribution.id,
			status: 'error',
			error: err
		}));
}

var rxReadFile = Rx.Observable.fromNodeCallback(fs.readFile);

function loadDistributionResult(distributionId) {
	return rxReadFile(getDistributionFilePath({ id: distributionId }))
		.map(content => JSON.parse(content.toString()));
}

function loadDistributionResults(distributionResults) {
	return Rx.Observable.from(distributionResults)
		.flatMap(distribution => loadDistributionResult(distribution.id));
}

function loadPreviousDistributions() {
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

		fs.createReadStream('koek.json')
			.on('error', function(err) {
				console.error(err);
				observer.onCompleted();
				completed = true;
			})
			.pipe(stream.input);
	});
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


Rx.Observable.from(scrapers)
	.map(scraper => getRxScraper(scraper))
	.merge(1)
	.concatMap(distribution => persistDistribution(distribution))
	.filter(distributionResult => distributionResult.status === 'ok')
	.map(distributionResult => distributionResult.result)
	.reduceConcat((state, distribution) => {
		return state.concat([distribution.id]);
	}, [], state => {
		return loadPreviousDistributions()
			.filter(distribution => state.indexOf(distribution.id) === -1);
	})
	.toJsonArray()
	.doWriteFile('output.json')
	.subscribe(
		result => process.stdout.write(result),
		err => console.error('Error:', err),
		() => {
			console.log('done');
		}
	);