'use strict';
(function() {

    var async = require('async');
    var chalk = require('chalk');
    var fs = require('fs');
    var path = require('../util/path.js');
    var prompt = require('prompt');
    var getDirName = require('path').dirname;
    var mkdirp = require('mkdirp');
    var inquirer = require("inquirer");
    var template = require('art-template');

    var mkdir = function(dir) {
        return function(callback) {
            process.stdout.write('Make ' + dir + '/ ... ');
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, function(err) {
                    if (err) {
                        console.log(err.message.red);
                    } else {
                        console.log(chalk.green('OK'));
                    }
                    callback(err);
                });
            } else {
                console.log(chalk.green('OK'));
                callback();
            }
        };
    };

    var writefile = function(filename, retmpl, data) {
        return function(callback) {
            process.stdout.write('Write ' + filename + ' ... ');

            template.config('extname', path.extname(filename));
            var tmpl = template(retmpl.replace(path.extname(filename), ''), data);

            var dir = getDirName(filename);

            if (dir) {
                mkdirp(dir, function(err) {
                    if (err) {
                        console.log(chalk.red(err.message));
                        return;
                    }

                    fs.writeFile(filename, tmpl, function(err) {
                        if (err) {
                            console.log(chalk.red(err.message));
                        } else {
                            console.log(chalk.green('OK'));
                        }
                        callback(err);
                    });
                });
                return;
            }

            fs.writeFile(filename, tmpl, function(err) {
                if (err) {
                    console.log(chalk.red(err.message));
                } else {
                    console.log(chalk.green('OK'));
                }
                callback(err);
            });
        };
    };

    function getAllFiles(dirname) {
        var res = [],
            files = fs.readdirSync(dirname);
        files.forEach(function(file) {
            var pathname = path.join(dirname, file),
                stat = fs.lstatSync(pathname);

            res.push(pathname);
            if (stat.isDirectory()) {
                res = res.concat(getAllFiles(pathname));
            }
        });
        return res;
    }

    var scaffolding = function(projectInfo, globalCallback) {

        var dirname = path.join(__dirname, 'template', 'scaffold', projectInfo.scaffold);

        var files = getAllFiles(dirname);

        async.each(files, function(repo, callback) {
            var stat = fs.lstatSync(repo);
            var rdirname = repo.replace(dirname, '').replace(path.sep, '');
            var fall = [];
            if (stat.isDirectory()) {
                fall.push(mkdir(rdirname));
            } else {
                fall.push(writefile(rdirname.replace('_', '.'), repo, projectInfo));
            }
            async.waterfall(fall, callback);
        }, function() {
            globalCallback();
        });
    };

    exports.init = function(options, projectInfo) {

        if (!projectInfo) {
            console.log('此操作会根据下面的问题，为efes项目在当前目录创建三个配置文件：');
            console.log(chalk.green(chalk.bold('.eslintrc')) + ': eslint检测规则，同时也是Sublime的插件Sublime-contrib-eslint配置文件');
            console.log(chalk.green(chalk.bold('.csslintrc')) + ': csslint检测规则');
            console.log(chalk.green(chalk.bold('.efesconfig')) + ': efes项目配置文件');
            projectInfo = {};
        }

        if (!options.force && fs.readdirSync(process.cwd()).length) {
            console.log(chalk.yellow('\nWarning: 此命令将会覆盖某些文件！，请使用 --force(-f) 继续。'));
            console.log(chalk.red('\n存在警告，放弃操作。'));
            return;
        }

        console.log(chalk.bold('\nPlease answer the following:'));
        var schema1 = [{
            'name': 'name',
            'message': '项目名称：',
            'default': projectInfo.name || path.basename(process.cwd())
        }, {
            'name': 'description',
            'message': '项目描述：',
            'default': projectInfo.description || '',
            'required': true
        }];
        var schema2 = [{
            'name': 'id',
            'message': '项目ID：',
            'default': projectInfo.id || '',
            'required': true
        }, {
            'name': 'publishUrl',
            'message': '线上环境地址：',
            'default': projectInfo.publishUrl || ''
        }, {
            'name': 'devUrl',
            'message': '开发环境地址：',
            'default': projectInfo.publishUrl || '',
            'required': true
        }];
        var schema3 = [{
            'type': 'list',
            'name': 'check',
            'message': '脚手架模板：',
            'choices': [{
                'name': 'none',
                checked: true
            }, {
                'name': 'h5',
                checked: false
            }, {
                'name': 'web',
                checked: false
            }],
            'default': true,
            'required': true
        }];

        var schema4 = [{
            'type': 'checkbox',
            'name': 'check',
            'message': '选择需要支持的扩展语言：',
            'choices': [{
                'name': 'es6',
                checked: true
            }, {
                'name': 'coffee',
                checked: true
            }, {
                'name': 'jade',
                checked: true
            }, {
                'name': 'less',
                checked: true
            }],
            'default': true,
            'required': true
        }];

        var schemaEnd = [{
            'name': 'confirm',
            'message': chalk.green('还需要对上述操作进行修改吗？'),
            'default': 'y/N'
        }];

        prompt.message = chalk.green('[?]');
        prompt.delimiter = ' ';
        prompt.start();
        prompt.get(schema1, function(error, res) {
            schema2[0].default = schema2[0].default || res.name;
            schema2[1].default = schema2[1].default || 'http://h5.edaijia.cn/' + res.name;
            schema2[2].default = schema2[2].default || 'http://h5.d.edaijia.cn/' + res.name;
            prompt.get(schema2, function(error, result) {
                result.name = res.name;
                result.description = res.description;

                inquirer.prompt(schema3, function(answers) {

                    result.scaffold = answers.check;

                    if (result.scaffold === 'none') {
                        result.exCoffee = false;
                        result.exLess = false;
                        result.exJade = false;
                        result.exES6 = false;

                        prompt.get(schemaEnd, function(error, endResult) {
                            var continuing = endResult.confirm.toLowerCase() !== 'y';
                            delete endResult.confirm;
                            if (continuing) {
                                console.log('');
                                scaffolding(result, function(error) {
                                    if (error) {
                                        console.log(chalk.red('\nAborted due to warnings.'));
                                    } else {
                                        console.log(chalk.green('\nDone, without errors.'));
                                    }
                                });
                            } else {
                                exports.init(options, result);
                            }
                        });
                        return;
                    }

                    inquirer.prompt(schema4, function(answers2) {

                        result.exCoffee = answers2.check.indexOf('coffee') !== -1;
                        result.exLess = answers2.check.indexOf('less') !== -1;
                        result.exJade = answers2.check.indexOf('jade') !== -1;
                        result.exES6 = answers2.check.indexOf('es6') !== -1;

                        prompt.get(schemaEnd, function(error, endResult) {
                            var continuing = endResult.confirm.toLowerCase() !== 'y';
                            delete endResult.confirm;
                            if (continuing) {
                                console.log('');
                                scaffolding(result, function(error) {
                                    if (error) {
                                        console.log(chalk.red('\nAborted due to warnings.'));
                                    } else {
                                        console.log(chalk.green('\nDone, without errors.'));
                                    }
                                });
                            } else {
                                exports.init(options, result);
                            }
                        });

                    });

                });

            });
        });
    };

})();
