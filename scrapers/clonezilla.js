var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
const sourceforge = require('../lib/sites/sourceforge');

module.exports = function(_,callback) {
	var project = sourceforge.project('clonezilla');
	Rx.Observable.merge(
		project.files('clonezilla_live_stable'),
		project.files('clonezilla_live_alternative')
	)
		.filter(entry => entry.type === 'directory')
		.flatMap(entry => project.files(entry.path))
		.filter(entry => entry.type === 'file')
		.map(entry => {
			const match = /^clonezilla-live-(\d+(?:\.\d+)*)-(?:\w+)-(amd64|x86_64|i386|i686).iso$/.exec(entry.name)
			if (!match) { return; }
			return {
				url: entry.url,
				arch: match[2],
				version: match[1],
			};
    })
    .filter(release => release)
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, {
        size: contentLength
      }))
    )
    .toArray()
    .map(releases => ({
			id: 'clonezilla',
			name: 'Clonezilla',
			tags: ['hybrid'],
			url: 'https://clonezilla.org/',
      releases: releases
    }))
    .subscribeCallback(callback);
};
