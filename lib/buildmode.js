var fs = require('fs');

var BRANCH_NAME = /refs\/heads\/([^\s]+)/;

function BuildMode (release_branch) {
  this.branch         = current_branch();
  this.release_branch = release_branch;
}

BuildMode.prototype.release = function release () {
  return this.branch === this.release_branch;
};

BuildMode.prototype.debug = function debug () {
  return this.branch !== this.release_branch;
};

function current_branch () {
  var ref = fs.readFileSync('.git/HEAD', 'utf8');
  return ref.match(BRANCH_NAME)[1];
}

BuildMode.current_branch = current_branch;

module.exports = BuildMode;
