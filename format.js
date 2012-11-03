
function singleline(str) {
	return str.replace(/\s+/g,' ');
}

function multiline(str) {
	return str.replace(/^\s+/,'').replace(/\s+$/,'').replace(/ +/g,' ');
}

module.exports.singleline = singleline;
module.exports.multiline = multiline;