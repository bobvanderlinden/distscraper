var sugar = require('sugar');
var request = require('../lib/rxrequest');
var filelisting = require('../lib/sites/filelisting');

module.exports = {
  id: 'voidlinux',
  name: 'Void Linux',
  tags: ['hybrid'],
  url: 'https://voidlinux.eu/',
  releases: filelisting.getEntries('https://alpha.de.repo.voidlinux.org/live/current/')
    .filter(entry => entry.type === 'file')
    .map(entry => {
      const match = /^void-live-(?<arch>i686|x86_64)-(?:musl-)?(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})(?:-(?<flavor>\w+))?\.iso$/g.exec(entry.name)
      return match && {
        url: entry.url,
        arch: match.groups.arch,
        version: `${match.groups.year}.${match.groups.month}.${match.groups.day}`
      }
    })
    .filter(entry => entry)
    .flatMap(release => request.contentlength(release.url)
      .map(contentLength => Object.merge(release, { size: contentLength }))
    )
};
