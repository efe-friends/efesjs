var chalk = require('chalk');
var pkg = require('../package.json');

exports.version = function() {
    console.log('efes v' + pkg.version);
};

exports.fatal = function(msg) {
    process.stdout.write(chalk.bold('Usage Exception: '));
    process.stdout.write(msg + '. Try ');
    process.stdout.write(chalk.bold('\'efes help\''));
    console.log('.');
};

exports.help = function(command) {
    var mod = require('./efes');
    var tasklist = mod.tasklist;

    if (command) {
        exports.helpCommand(command, tasklist[command], mod.optlist);
    } else {
        console.log(chalk.bold('Name:'));
        console.log('  efes - ' + pkg.description);
        console.log(chalk.bold('\nUsage:'));
        console.log('  ' + type + ' [command] [args]');
        console.log('  This help file provides a detailed command reference.');
        console.log(chalk.bold('\nCommands:'));
        Object
            .keys(tasklist)
            .map(function(taskName) {
                return '  ' + taskName + ': ' + tasklist[taskName].info;
            })
            .forEach(function(str) {
                console.log(str);
            });
        console.log('\nRun \'' + type + ' help [command]\' to get detail information of command.');
    }
};

exports.helpCommand = function(commandName, commandInfo, optlist) {
    if (commandInfo) {
        console.log(chalk.bold('Name:'));
        console.log('  ' + commandName + ' - ' + commandInfo.info);
        console.log(chalk.bold('\nArgs:'));
        commandInfo.args.forEach(function(arg) {
            var short = '';
            if (optlist[arg].short) {
                short = '(-' + optlist[arg].short + ')';
            }
            console.log('  --' + arg + short + ': ' + optlist[arg].info);
        });
    } else {
        exports.fatal('\'' + commandName + '\' is not a gsproxy command');
    }
};