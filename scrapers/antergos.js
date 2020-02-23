var async = require('async');
var sugar = require('sugar');
var URL = require('../lib/url');
var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
const sourceforge = require('../lib/sites/sourceforge');

const project = sourceforge.project('antergos');

module.exports = {
  id: 'antergos',
  name: 'Antergos',
  tags: ['hybrid'],
  url: 'https://antergos.com/',
  releases: project.files('mirror/iso/release')
    .filter(entry => entry.type === 'file')
		.map(entry => {
			const match = /^antergos-(\d+(?:\.\d+)+)-(x86_64|i386).iso$/.exec(entry.name)
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
}
