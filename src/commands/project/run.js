'use strict';

(function() {

  const chalk = require('chalk');
  const fs = require('fs');

  const path = require('../../utils/path.js');

  const project = require('./utils/project.js');

  module.exports = function(options) {

    let dirname = process.cwd();

    let efesconfig = path.join(dirname, 'efesproject.json');

    if (!fs.existsSync(efesconfig)) {

      console.log(chalk.red('在当前目录下，未找到 efesproject.json 文件。'));

    } else {

      project(dirname, options);

    }

  };

})();
