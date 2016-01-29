"use strict";

(function() {

  const async = require('async');
  const chalk = require('chalk');
  const childProcess = require('child_process');
  const fs = require('fs');

  const fsp = require('../../utils/fs');
  const path = require('../../utils/path.js');



  module.exports = (options) => {

    console.log(`开始安装 ${options.cmd} ...`);

    let repo = options.cmd;
    let efesdir = path.join(__dirname, '..', '..', '..');
    let condir = path.join(efesdir, 'dist', 'commands', repo, 'command.json');

    let _cmd = fsp.readJSONSync(condir);

    if (_cmd) {

      if (_cmd.installed === true && !options.force) {
        console.log('\n' + chalk.green(`此命令已经安装成功，请运行 efes install -f --cmd ${repo} 进行强制重新安装。`) + '\n');
        process.exit(1);
      }

      try {


        if (_cmd.packages.length > 0) {

          _cmd.packages.some(function(_repo) {

            let cmd = `npm install ${_repo} --save`;

            childProcess.execSync(cmd, {
              cwd: efesdir,
              stdio: 'inherit'
            });

          });

        }
      } catch (e) {
        console.log('\n' + chalk.red('安装失败！') + '\n');
        process.exit(1);
      }

      _cmd.installed = true;

      var a = fsp.writeJSONSync(condir, _cmd);

      console.log('\n' + chalk.green('安装成功！') + '\n');

    } else {
      console.log('\n' + chalk.red(`未找到 ${repo} 的配置文件，无法安装此命令。`) + '\n');
    }

  };

})();
