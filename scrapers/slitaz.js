const Rx = require('rx')

module.exports = {
	id: 'slitaz',
	name: 'SliTaz',
	tags: ['hybrid'],
	url: 'http://www.slitaz.org/',
	releases: Rx.Observable.from([{
		version: '4.0',
		url: 'http://softwarebakery.com/apps/drivedroid/distros/slitaz-4.0.iso',
		size: 36700160
	}])
};
