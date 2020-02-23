const request = require('../lib/rxrequest')

function combinations(arrays) {
	if (arrays.length === 1) {
		return arrays[0].map(function(a) { return [a]; });
	}
	var elems = arrays[0];
	var rest = arrays.slice(1);
	return elems.map(function(elem) {
		return combinations(rest).map(function(x) {
			var r = x.slice(0);
			r.unshift(elem);
			return r;
		});
	}).flatten(1);
}

const archTranslate = {
	'amd64': 'grml64',
	'i386': 'grml32',
	'96': 'grml96'
};

module.exports = {
	id: 'grml',
	name: 'Grml',
	tags: ['hybrid'],
	url: 'http://grml.org/',
	releases: request.dom('http://grml.org/download/')
		.flatMap($ => {
			const flavours = $('#download_flavour option').map((option) => {
				return option.attr('value');
			});
			const archs = $('#download_arch option').map((option) => {
				return option.attr('value');
			});
			const version = $('input[name=version]').attr('value');
			const versions = [version]; // Only the latest version.

			return combinations([flavours,archs,versions]);
		})
		.map(([flavour, arch, version]) => ({
			version,
			arch,
			url: `http://download.grml.org/${archTranslate[arch]}-${flavour}_${version}.iso`
		}))
		.flatMap(release => request.contentlength(release.url)
			.map(contentLength => Object.merge(release, { size: contentLength }))
		)
};
