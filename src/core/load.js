"use strict";
global.logTimeStart = (new Date()).getTime();
global.logTime = function(msg){
  let logTimeStep = (new Date()).getTime();
  console.log(msg, logTimeStep - global.logTimeStart);
};
global.efesecho = console;

(function() {

  const async = require('async');
  const chalk = require('chalk');
  const program = require('commander');
  const fs = require('fs');

  const path = require('../utils/path');
  const fsp = require('../utils/fs');

  const pkg = require('../../package.json');

  const run = function(command) {

    let repo = command.name();
    let options = command.opts();
    let dirname = '../commands/';

    let _cmd = fsp.readJSONSync(path.join(__dirname, dirname, repo, 'command.json'));

    if (_cmd) {

      if (_cmd.installed === false) {
        global.efesecho.log('\n' + chalk.red(`此命令需要安装后才能使用，请运行 efes install --cmd ${repo} 进行安装。`) + '\n');
        process.exit(1);
      }

      if (_cmd.requires && _cmd.requires.length > 0) {

        _cmd.requires.some(function(_repo) {

          let _stats = fs.existsSync(path.join(__dirname, dirname, _repo, 'command.json'));

          if (!_stats) {
            global.efesecho.log(chalk.yellow.bold(`监测到 ${repo} 所依赖的 efes 命令 ${_repo} 有误，可能导致 ${repo} 不能使用。`))
          }

        });
      }
    }

    require('../commands/' + command.name() + '/run')(options);

  };


  program
    .version(pkg.version);

  program
    .command('help [cmd]')
    .description('显示命令 [cmd] 的帮助')
    .action(function(cmd) {
      program.commands.some(function(command) {
        if (command.name() === cmd) {
          command.help();
        }
      });
      if (cmd) {
        global.efesecho.log("'\s' 不是一个 efes 的命令。参见 'efes --help'.", cmd);
      } else {
        program.help();
      }
    });

  var dirname = path.join(__dirname, '..', 'commands');

  let files = fs.readdirSync(dirname);

  async.each(files, function(repo, callback) {

    let _cmd = fsp.readJSONSync(path.join(dirname, repo, 'command.json'));
    if (_cmd) {

      let _pro = program
        .command(_cmd.name)
        .description(_cmd.description);

      if (_cmd.alias) {
        _pro.alias(_cmd.alias);
      }

      if (_cmd.options.length) {
        _cmd.options.some(function(opt) {
          _pro.option(opt.flags, opt.description)
        });
      }

      _pro.action(run);
    }
    callback();

  }, function() {});



  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.help();
  }

})();
