var assert = require('assert');
var URL = require('url');
function isDirectoryUrl(url) {
  assert(typeof url === 'string');
  return url[url.length-1] === '/';
}

function isFileUrl(url) {
  assert(typeof url === 'string');
  return !isDirectoryUrl(url);
}

// TODO: Extend URL instead of assigning functions to the existing URL object.
URL.isDirectoryUrl = isDirectoryUrl;
URL.isFileUrl = isFileUrl;

module.exports = URL;