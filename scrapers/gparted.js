var Rx =require('../lib/rxnode');
var request =require('../lib/rxrequest');
const sourceforge = require('../lib/sites/sourceforge');

const project = sourceforge.project('gparted');

module.exports = {
  id: 'gparted',
  name: 'GParted',
  tags: ['hybrid'],
  url: 'https://gparted.org/',
  releases: project.files('gparted-live-stable')
		.filter(entry => entry.type === 'directory')
		.flatMap(entry => project.files(entry.path))
    .filter(entry => entry.type === 'file')
		.map(entry => {
			const match = /^gparted-live-(\d+(?:\.\d+)+(?:-\d+)?)-(x86_64|i386|i686|amd64)(?:-\w+).iso$/.exec(entry.name)
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
