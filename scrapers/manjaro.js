var Rx = require("../lib/rxnode");
var request = require("../lib/rxrequest");
const sourceforge = require("../lib/sites/sourceforge");

var project = sourceforge.project("manjarolinux");
module.exports = {
  id: "manjaro",
  name: "Manjaro",
  tags: ["hybrid"],
  url: "https://manjaro.org/",
  releases: project.files("release")
    .filter(entry => entry.type === "directory")
    .flatMap(entry => project.files(entry.path))
    .filter(entry => entry.type === "directory")
    .flatMap(entry => project.files(entry.path))
    .filter(entry => entry.type === "file")
    .map(entry => {
      const match = /^manjaro-(?:\w+)-(\d+(?:\.\d+)+(?:-\d+)?)-(?:\w+)-(x86_64|i386|i686|amd64).iso$/.exec(
        entry.name
      );
      if (!match) {
        return;
      }
      return {
        url: entry.url,
        arch: match[2],
        version: match[1]
      };
    })
    .filter(release => release)
    .flatMap(release =>
      request.contentlength(release.url).map(contentLength =>
        Object.merge(release, {
          size: contentLength
        })
      )
    )
};
