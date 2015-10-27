'use strict';
(function() {

    //var async = require('async');
    var chalk = require('chalk');
    var fs = require('fs');
    //var fsp = require('../util/fs');
    var path = require('../util/path.js');
    //var prompt = require('prompt');
    //var inquirer = require("inquirer");
    //var glob = require('glob');

    var addHooks = function(dirname) {

        console.log(chalk.green('Add "pre-commit hooks" to you git.'));

        var hook = path.join(dirname, '.git/hooks/pre-commit');

        fs.writeFileSync(hook, fs.readFileSync(path.join(__dirname, 'template/hooks/pre-commit')));
        fs.chmodSync(hook, '751');
        console.log(chalk.green('Hooks successfully added.'));
        return;
    };

    var addGitignore = function(dirname) {
        console.log(chalk.green('Add ".gitignore" to you git.'));

        var tmpl = fs.readFileSync(path.join(__dirname, 'template/root/' + 'gitignore'), {
            encoding: 'utf8'
        });

        var gitignore = path.join(dirname, '.gitignore');

        fs.writeFileSync(gitignore, tmpl);

        console.log(chalk.green('.gitignore successfully added.'));
        return;
    };

    exports.hook = function(options) {
        addHooks(process.cwd());
        addGitignore(process.cwd());
    };

})();
