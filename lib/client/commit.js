"use strict";
(function() {
    var async = require('async');
    var chalk = require('chalk');
    var childProcess = require('child_process');
    var fs = require('fs');
    var fsp = require('../util/fs');
    var path = require('../util/path.js');
    var table = require('text-table');
    var glob = require('glob');

    var linters = require('./model/linters/lint.js');
    var ckver = require('./model/version/ckver.js');

    var rFileStatus = /^[A-Z]\s+(.+)$/;

    var getConfig = function(configs, dirs) {
        var config;

        if (!dirs.length) {
            config = configs.root;
            config.baseDir = '.';
            return config;
        }
        config = configs[dirs.join(path.sep)];
        if (config) {
            config.baseDir = dirs.join(path.sep);
            return config;
        }

        return getConfig(configs, dirs.splice(0, dirs.length - 1));
    };

    exports.checkFiles = function(files, options) {

        var dirname = options.base;
        //var repos = {};
        var configs = {};

        async.each(fs.readdirSync(dirname), function(repo, callback) {

            //console.log(chalk.red(repo));

            var subdirname = path.join(dirname, repo);
            var efesconfig = path.join(dirname, repo, '.efesconfig');
            var data;
            if (repo === '.efesconfig') {
                data = fsp.readJSONSync(subdirname);
                if (data) {
                    configs.root = data;
                    //repos[repo] = path.join(dirname, repo);
                }
            } else if (fs.existsSync(efesconfig)) {
                data = fsp.readJSONSync(efesconfig);
                if (data) {
                    configs[repo] = data;
                    //repos[repo] = path.join(dirname, repo);
                }
            } else if (fs.statSync(subdirname).isDirectory()) {
                glob('**/.efesconfig', {
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
                        if (data) {
                            configs[_subrepo] = data;
                            //repos[_subrepo] = path.join(dirname, _subrepo);
                        }
                    });
                });
            }
            callback();
        }, function() {

            if (!configs) {
                console.log('Lint is not configed.');
                return;
            }

            var filesLinted = 0;

            var lintErrors = 0;

            var changedDir = [];

            files.some(function(filename) {
                var dirs = path.dirname(filename).split(path.sep);

                var config = getConfig(configs, dirs);
                var linter = config.lint;
                var suffix = path.extname(filename).slice(1);
                var _sublinter = linter[suffix];
                if (changedDir.indexOf(config.baseDir) === -1) {
                    changedDir.push(config.baseDir);
                }

                if (_sublinter) {
                    filesLinted += 1;
                    lintErrors += linters[_sublinter.engine](filename, path.join(options.base, config.baseDir, _sublinter.config));
                }

                if ( /^(x|d|s)?html?$/i.test(suffix)) {
                    ckver.checkVer(filename);
                }
            });

            if (filesLinted === 0) {
                console.log('No files needed to be linted');
            } else if (!lintErrors) {
                console.log('\n' + chalk.white.bgGreen.bold(' OKAY ') + ' No lint errors.');
            }

            //console.log('\n' + 'Check JS/CSS VERSION string...');

            /*async.each(changedDir, function(dirname, callback) {
                async.each(fs.readdirSync(dirname), function(repo, subcallback) {
                    if (path.extname(repo).slice(1) === 'html') {
                        ckver.checkVer(path.join(dirname, repo));
                    }
                    subcallback();
                }, function() {
                    callback();
                });
            }, function() {
            });*/

            return lintErrors;
        });
    };

    exports.commit = function(options) {
        console.log('Linting...');
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
                        exports.checkFiles(stdout, options);
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
