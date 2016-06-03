"use strict";
(function() {

  const fsp = require('./fs.js');
  const path = require('./path.js');

  const findSpaceInfo = function(cwd = process.cwd()) {
    let spaceInfo = fsp.readJSONSync(path.join(cwd,'efesproject.json'));
    if (spaceInfo) {
      return {
        baseDir: cwd,
        spaceInfo: spaceInfo
      };
    }

    if (cwd == path.sep) {
      return null;
    }

    return findSpaceInfo(path.join(cwd, '..'));

  };

  let env = findSpaceInfo();

  module.exports = env;

})();
