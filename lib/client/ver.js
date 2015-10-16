"use strict";
/*
1、搜索有修改的目录中是否包含 .ehookconfig 文件。
2、对 .ehookconfig文件当前目录下，和子目录下的文件进行检索
3、找到.html、.htm、.jade文件，给这样文件中引用的js、css的url后添加 ‘?VERSION’ 字符串
 */
(function() {
    var async = require('async');
    var chalk = require('chalk');
    var childProcess = require('child_process');
    var csslint = require('csslint').CSSLint;
    var eslint = require('eslint').linter;
    var fs = require('fs');
    var fsp = require('../util/fs');
    var path = require('../util/path.js');
    var table = require('text-table');
    var glob = require('glob');

    var rFileStatus = /^[A-Z]\s+(.+)$/;

    var linters = {
        reporter: function(messages, file) {
            if (!messages.length) {
                return;
            }
            var output = messages.map(function(message) {
                var out = [];
                out.push(message.line);
                out.push(message.col);
                out.push(message.warn ? chalk.yellow('warning') : chalk.red('error'));
                out.push(message.message.slice(0, -1));
                out.push(chalk.grey(message.rule.id));
                return out;
            });
            output = table(output, {
                align: ['r', 'l']
            });
            output = output.split('\n').map(function(el) {
                return el.replace(/(\d+)\s+(\d+)/, function(m, p1, p2) {
                    return chalk.grey(p1 + ':' + p2);
                });
            }).join('\n');
            console.log('\n' + file + '\n');
            console.log(output);
            console.log(chalk.red.bold('\n\u2716 ' + messages.length + ' problems'));
        },
        eslint: function(file, config) {
            console.log(chalk.green.bold(file));
            var code = fs.readFileSync(file, {
                encoding: 'utf8'
            });
            var configs = JSON.parse(fs.readFileSync(config, {
                encoding: 'utf8'
            }));
            var messages = eslint.verify(code, configs);
            var errorLen = 0;
            messages = messages.map(function(message) {
                var warn = !message.fatal && message.severity === 1;
                if (!warn) {
                    errorLen += 1;
                }
                return {
                    line: message.line || 0,
                    col: message.column || 0,
                    message: message.message.replace(/\.$/, ''),
                    rule: {
                        id: message.ruleId
                    },
                    warn: warn
                };
            });
            this.reporter(messages, file);
            return errorLen;
        },
        csslint: function(file, config) {
            var code = fs.readFileSync(file, {
                encoding: 'utf8'
            });
            var configs = JSON.parse(fs.readFileSync(config, {
                encoding: 'utf8'
            }));
            var messages = csslint.verify(code, configs).messages;
            var errorLen = 0;
            messages = messages.map(function(message) {
                var warn = message.type === "warning";
                if (!warn) {
                    errorLen += 1;
                }
                return {
                    line: message.line || 0,
                    col: message.col || 0,
                    message: message.message.replace(/\.$/, ''),
                    rule: {
                        id: message.rule.id
                    },
                    warn: warn
                };
            });
            this.reporter(messages, file);
            return errorLen;
        }
    };

    var getLinter = function(lints, dirs) {
        var linter;

        if (!dirs.length) {
            linter = lints.root;
            linter.baseDir = '';
            return linter;
        }
        linter = lints[dirs.join(path.sep)];
        if (linter) {
            linter.baseDir = dirs.join(path.sep);
            return linter;
        }

        return getLinter(lints, dirs.splice(0, dirs.length - 1));
    };

    exports.lintFiles = function(files, options) {

        var dirname = options.base;
        var repos = {};
        var lints = {};

        async.each(fs.readdirSync(dirname), function(repo, callback) {

            //console.log(repo);

            var subdirname = path.join(dirname, repo);
            var ehookconfig = path.join(dirname, repo, '.ehookconfig');
            var data;
            if (repo === '.ehookconfig') {
                data = fsp.readJSONSync(subdirname);
                if (data.lint) {
                    lints.root = data.lint;
                    repos[repo] = path.join(dirname, repo);
                    //console.log(repos);
                }

            } else if (fs.existsSync(ehookconfig)) {
                data = fsp.readJSONSync(ehookconfig);
                if (data.lint) {
                    lints[repo] = data.lint;
                    repos[repo] = path.join(dirname, repo);
                }
            } else if (fs.statSync(subdirname).isDirectory()) {
                glob('**/.ehookconfig', {
                    cwd: subdirname,
                    sync: true
                }, function(err, subfiles) {
                    if (err) {
                        console.log(chalk.red(err.message));
                        return;
                    }
                    subfiles.forEach(function(subrepo) {
                        var data = fsp.readJSONSync(path.join(subdirname, subrepo));
                        var _subrepo = [repo, path.dirname(subrepo)].join(path.sep);
                        if (data.lint) {
                            lints[_subrepo] = data.lint;
                            repos[_subrepo] = path.join(dirname, _subrepo);
                        }
                    });
                });
            }
            callback();
        }, function() {

            if (!lints) {
                console.log('Lint is not configed.');
                return;
            }

            var filesLinted = 0;

            var lintErrors = 0;

            files.some(function(filename) {
                console.log(filename);
                var dirs = path.dirname(filename).split(path.sep);
                var linter = getLinter(lints, dirs);
                var _sublinter = linter[path.extname(filename).slice(1)];
                if (_sublinter) {
                    filesLinted += 1;
                    lintErrors += linters[_sublinter.engine](filename, path.join(options.base, linter.baseDir, _sublinter.config));
                }
            });
            if (filesLinted === 0) {
                console.log('No files needed to be linted');
            } else if (!lintErrors) {
                console.log('\n' + chalk.white.bgGreen.bold(' OKAY ') + ' No lint errors.');
            }
            return lintErrors;
        });
    };

    exports.ver = function(options) {
        console.log('Adding VERSION string...');
        childProcess.exec('git diff --name-status HEAD', {
            cwd: options.base
        }, function(err, stdout) {
            if (err) {
                console.log(chalk.bold('Exception: ') + 'Not a git repo.');
            } else {
                if (stdout) {
                    stdout = stdout.trim().split('\n');
                    stdout = stdout.filter(function(fileStatus) {
                        return fileStatus.indexOf('D') !== 0;
                    });
                    stdout = stdout.map(function(fileStatus) {
                        return rFileStatus.exec(fileStatus)[1];
                    });
                    if (stdout.length) {
                        exports.lintFiles(stdout, options);
                    } else {
                        console.log('No files changed.');
                    }
                } else {
                    console.log('No files changed.');
                }
            }
        });
    };

})();
