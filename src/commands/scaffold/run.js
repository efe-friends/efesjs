'use strict';

(function() {

  const chalk = require('chalk');
  const fs = require('fs');

  const scaffolding = require('./utils/scaffolding.js');
  const Schema = require('./utils/schema.js');

  const info = require('../../utils/efesEnv.js');

  module.exports = function(options, projectInfo) {

    let localDirInfo = info.getLocalDirInfo(process.cwd());
    console.log('----',localDirInfo);
    if (!projectInfo) {

      global.efesecho.log('此操作会根据下面的问题，为efes项目在当前目录创建几个配置文件：');
      global.efesecho.log(chalk.green(chalk.bold('.eslintrc, .eslintignore')) + ': eslint检测规则和忽略规则，同时也是Sublime的插件Sublime-contrib-eslint配置文件');
      global.efesecho.log(chalk.green(chalk.bold('.csslintrc, .csslintignore')) + ': csslint检测规则和忽略规则');
      global.efesecho.log(chalk.green(chalk.bold('.efesconfig')) + ': efes项目配置文件');
      global.efesecho.log(chalk.green(chalk.bold('concatfile.json')) + ': efes项目文件合并配置规则');
      projectInfo = {};

    }

    if (!options.force && fs.readdirSync(process.cwd()).length) {

      global.efesecho.log(chalk.yellow('\nWarning: 此命令将会覆盖某些文件！，请使用 --force(-f) 继续。'));
      global.efesecho.log(chalk.red('\n存在警告，放弃操作。'));
      return;

    }

    global.efesecho.log(chalk.bold('\n请回答下列问题：'));


    let schema = new Schema(options.type == 'default');

    schema.start(options, localDirInfo, function(info) {

      scaffolding(info, function(error) {
        if (error) {
          global.efesecho.log(chalk.red('\nAborted due to warnings.'));
        } else {
          global.efesecho.log(chalk.green('\nDone, without errors.'));

        }
      });

    });

  };

})();
