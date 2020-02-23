var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
const sourceforge = require('../lib/sites/sourceforge');

const project = sourceforge.project('linuxlite');

module.exports = {
  id: 'linuxlite',
  name: 'Linux Lite',
  tags: ['hybrid'],
  url: 'https://linuxliteos.com/',
  releases: project.files()
    .filter(entry => entry.type === 'directory')
    .flatMap(entry => project.files(entry.path))
    .filter(entry => entry.type === 'file')
    .map(entry => {
			const match = /^linux-lite-(\d+(?:\.\d+)*)-(64bit|32bit).iso$/.exec(entry.name)
			return match && {
				url: entry.url,
				version: match[1],
				arch: match[2]
			};
		})
		.filter(release => release)
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, {
        size: contentLength
      }))
    )
}
