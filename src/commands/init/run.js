'use strict';
(() => {

  const childProcess = require('child_process');

  module.exports = function(options) {

    let _cmd = 'efes sc -t default --color';

    if (options.force) {
      _cmd += ' -f';
    }

    let stdout = childProcess.execSync(_cmd, { stdio: 'inherit' });

  };

})();
