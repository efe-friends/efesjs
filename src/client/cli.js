"use strict";

(() => {
  const program = require('commander');
  const pkg = require('../../package.json');

  const run = function(command) {
    require('./' + command.name())[command.name()](command.opts());
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
        console.log("'\s' 不是一个 efes 的命令。参见 'efes --help'.", cmd);
      } else {
        program.help();
      }
    });

  program
    .command('hook')
    .description('为git添加pre commit操作')
    .action(run);

  program
    .command('commit')
    .description('当git commit时，触发运行pre commit操作')
    .option('-c, --color')
    .action(run);

  program
    .command('init')
    .description('为项目初始化项目配置文件，lint规则文件和项目文件结构')
    .option('-f, --force', '在非空目录强制执行')
    .action(run);

  program
    .command('ver')
    .description('为引用的js、css增加版本号')
    .option('-s, --string [value]', '设定需要增加版本号字符串，默认：VERSION')
    .action(run);

  /*
  program
      .command('publish')
      .description('publish git changesets to subversion')
      .option('--author <username>', 'specify a author to interacting with subversion repository instead of the default author of commit')
      .option('--preview', 'preview the range of changesets for publish')
      .option('--skip <commit>', 'set the start point of publish after the skip one')
      .action(run);

  program
      .command('push')
      .description('git push origin master and publish')
      .action(run);

  program
      .command('pull')
      .description('clone/update all the git repositories')
      .action(run);*/

  /*program
    .command('scaffold')
    .description('自动生成前端代码脚手架')
    .option('-t, --type [value]', '脚手架类型')
    .option('-f, --force', '在非空目录强制执行')
    .action(run);

  /*program
      .command('start')
      .description('start a local proxy server')
      .option('-d, --daemon', 'run server on daemon mode')
      .option('--cwd <dir>', 'set the working directory, default is process.cwd()')
      .option('-p, --port <port>', 'the port for the server listening')
      .option('--livereload', 'enable LiveReload')
      .action(run);*/

  /*program.command('test')
      .description('run test specs against chaned files')
      .action(run);*/

  /*program
    .command('watch')
    .description('run tasks whenever watched files are added, changed or deleted')
    .option('--cwd <dir>', 'set the working directory, default is process.cwd()')
    .option('--livereload', 'enable LiveReload')
    .action(run);*/

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.help();
  }

})();
