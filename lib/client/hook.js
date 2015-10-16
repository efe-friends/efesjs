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

        //var efesconfig = path.join(dirname, '.efesconfig');
        var hook = path.join(dirname, '.git/hooks/pre-commit');

        //if (fs.existsSync(efesconfig)) {
            fs.writeFileSync(hook, fs.readFileSync(path.join(__dirname, 'hooks/pre-commit')));
            fs.chmodSync(hook, '751');
            console.log(chalk.green('Hooks successfully added.'));
        //} else {
            //console.log(chalk.red('The .efesconfig file is not found.'));
            return;
        //}
    };

    exports.hook = function(options) {
        addHooks(options.base);
    };

})();
