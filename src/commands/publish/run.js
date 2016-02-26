'use strict';

(function() {

  const chalk = require('chalk');
  const fs = require('fs');

  const path = require('../../utils/path.js');

  const publish = require('./utils/publish.js');

  module.exports = function(options) {

    options.publish = true;

    let dirname = process.cwd();

    let efesconfig = path.join(dirname, '.efesconfig');

    if (!fs.existsSync(efesconfig)) {

      console.log(chalk.red('在当前目录下，未找到 .efesconfig 文件。'))

    } else {

      publish(dirname, options);

    }

  };

})();
