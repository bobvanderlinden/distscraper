var Rx = require('../lib/rxnode');
var request = require('../lib/rxrequest');
const sourceforge = require('../lib/sites/sourceforge');

const project = sourceforge.project('ophcrack');

module.exports = {
  id: 'ophcrack',
  name: 'ophcrack',
  tags: ['hybrid'],
  url: 'http://ophcrack.sourceforge.net/',
  releases: project.files('ophcrack-livecd')
    .filter(entry => entry.type === 'directory')
    .flatMap(entry => project.files(entry.path))
    .filter(entry => entry.type === 'file')
    .map(entry => entry.url)
    .filter(url => /\.iso$/.test(url))
    .map(url => ({
			url: url,
      version: /(\d+(\.\d+)*(-\d+)?)/g.test(url)
    }))
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, {
        size: contentLength
      }))
    )
}
