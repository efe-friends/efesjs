'use strict';
(()=> {

    const chalk = require('chalk');
    const fs = require('fs');
    const path = require('../../utils/path.js');

    const addHooks = function(dirname) {

        console.log(chalk.green('Add "pre-commit hooks" to you git.'));

        let hook = path.join(dirname, '.git/hooks/pre-commit');

        fs.writeFileSync(hook, fs.readFileSync(path.join(__dirname, 'hooks/pre-commit')));
        fs.chmodSync(hook, '751');
        console.log(chalk.green('Hooks successfully added.'));
        return;
    };

    const addGitignore = function(dirname) {
        console.log(chalk.green('Add ".gitignore" to you git.'));

        let tmpl = fs.readFileSync(path.join(__dirname, 'root/' + 'gitignore'), {
            encoding: 'utf8'
        });

        let gitignore = path.join(dirname, '.gitignore');

        fs.writeFileSync(gitignore, tmpl);

        console.log(chalk.green('.gitignore successfully added.'));
        return;
    };

    module.exports = function(options) {
        addHooks(process.cwd());
        addGitignore(process.cwd());
    };

})();
