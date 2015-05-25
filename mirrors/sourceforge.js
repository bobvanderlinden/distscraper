var URL = require('url');
var mirrors = [
	"http://aarnet.dl.sourceforge.net/",
	"http://citylan.dl.sourceforge.net/",
	"http://colocrossing.dl.sourceforge.net/",
	"http://cznic.dl.sourceforge.net/",
	"http://freefr.dl.sourceforge.net/",
	"http://garr.dl.sourceforge.net/",
	"http://heanet.dl.sourceforge.net/",
	"http://hivelocity.dl.sourceforge.net/",
	"http://ignum.dl.sourceforge.net/",
	"http://internode.dl.sourceforge.net/",
	"http://iweb.dl.sourceforge.net/",
	"http://jaist.dl.sourceforge.net/",
	"http://kent.dl.sourceforge.net/",
	"http://liquidtelecom.dl.sourceforge.net/",
	"http://nbtelecom.dl.sourceforge.net/",
	"http://nchc.dl.sourceforge.net/",
	"http://ncu.dl.sourceforge.net/",
	"http://netcologne.dl.sourceforge.net/",
	"http://optimate.dl.sourceforge.net/",
	"http://skylink.dl.sourceforge.net/",
	"http://softlayer.dl.sourceforge.net/",
	"http://softlayer.dl.sourceforge.net/",
	"http://softlayer.dl.sourceforge.net/",
	"http://sunet.dl.sourceforge.net/",
	"http://superb.dl.sourceforge.net/",
	"http://superb.dl.sourceforge.net/",
	"http://tcpdiag.dl.sourceforge.net/",
	"http://tenet.dl.sourceforge.net/",
	"http://ufpr.dl.sourceforge.net/",
	"http://vorboss.dl.sourceforge.net/",
	"http://waia.dl.sourceforge.net/"
];

module.exports = function getMirrors(url) {
	var match;
	url = URL.parse(url);
	if (url.host === 'sourceforge.net') {
		// http://sourceforge.net/projects/gparted/files/gparted-live-stable/0.21.0-1/gparted-live-0.21.0-1-amd64.iso
		match = /^\/projects\/([^\/]+)\/files(\/.*[^\/])(\/download)?$/.exec(url.path);
		if (match) {	
			var project = match[1];
			var path = match[2];
			return mirrors.map(function(mirror) {
				return mirror + 'project/' + project + path;
			});
		}
	}
	return [];
}
