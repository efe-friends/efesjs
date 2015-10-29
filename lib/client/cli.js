"use strict";

(function() {
    var program = require('commander');
    var pkg = require('../../package.json');

    var run = function(command) {
        require('./' + command.name())[command.name()](command.opts());
    };

    program
        .version(pkg.version);

    program
        .command('help [cmd]')
        .description('display help for [cmd]')
        .action(function(cmd) {
            program.commands.some(function(command) {
                if (command.name() === cmd) {
                    command.help();
                }
            });
            if (cmd) {
                console.log("'\s' is not a efes command. See 'efes --help'.", cmd);
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
        .description('为项目初始化项目配置文件和lint规则文件')
        .option('-f, --force', '在非空目录强制执行')
        .action(run);

    /*program
        .command('lint')
        .description('run linter on files changed')
        .action(run);

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

    program
        .command('scaffold')
        .description('自动生成前端代码脚手架')
        .option('-t, --type', '')
        .option('-f, --force', 'force run on a non empty directory')
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

    program
        .command('watch')
        .description('run tasks whenever watched files are added, changed or deleted')
        .option('--cwd <dir>', 'set the working directory, default is process.cwd()')
        .option('--livereload', 'enable LiveReload')
        .action(run);

    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.help();
    }

})();
