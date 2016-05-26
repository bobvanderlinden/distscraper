var assert = require('assert');
var Rx = require('../rxnode');
var request = require('../rxrequest');
var path = require('path');

function getEntries(projectName, filePath) {
  assert(typeof projectName === 'string');
  assert(typeof filePath === 'string' || typeof filePath === 'undefined' || filePath === null);
  filePath = filePath || '';
  var url = 'https://sourceforge.net/' + path.join('projects', projectName, 'files', filePath) + '/';
  return request.dom(url)
    .flatMap(function($) {
      return Rx.Observable.from(
        $('#files_list tbody tr')
          .map(function(row) {
            row = $(row);
            var fileName = row.find('th[headers=files_name_h]').text().trim();
            // Sourceforge outputs file urls with `/download` appended.
            // This is for browsers, but download-user-agents can use the url without `/download`,
            // so just strip that away.
            var url = row.find('th[headers=files_name_h] a.name').attr('href').replace(/\/download$/, '');
            return {
              name: fileName,
              path: path.join(filePath, fileName),
              url: url,
              date: row.find('td[headers=files_date_h] abbr').attr('title'),
              size: row.find('td[headers=files_size_h]').text(),
              downloads: row.find('td[headers=files_downloads_h]').text().trim(),
              type: row.hasClass('folder') ? 'directory' : 'file'
            };
          })
        );
    });
}

module.exports = {
  getEntries: getEntries,
  project: function(projectName) {
    return {
      files: function(path) {
        return getEntries(projectName, path);
      }
    };
  }
};