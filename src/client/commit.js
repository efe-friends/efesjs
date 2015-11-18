"use strict";
(function() {
  var async = require('async');
  var chalk = require('chalk');
  var childProcess = require('child_process');
  var fs = require('fs');
  var fsp = require('../utils/fs');
  var path = require('../utils/path.js');
  var table = require('text-table');
  var walk = require('../utils/walk.js');
  //var glob = require('glob');

  var linters = require('./model/linters/lint.js');
  var ckver = require('./model/version/ckver.js');
  //var ckphoto = require('./model/version/ckphoto.js');

  var rFileStatus = /^([A-Z])\s+(.+)$/;

  var getConfig = function(configs, dirs) {
    var config = {};

    if (!dirs.length) {
      if (config.root) {
        config = configs.root;
      }
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

    var dirname = process.cwd();

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
        }
      } else if (fs.existsSync(efesconfig)) {
        data = fsp.readJSONSync(efesconfig);
        if (data) {
          configs[repo] = data;
        }
      } else if (fs.statSync(subdirname).isDirectory()) {

        var regIncludes = [/\.efesconfig$/i];
        var regExcludes = [/node_modules/, /\.git/, /\.tmp/];

        walk(subdirname, regIncludes, regExcludes, function(err, subfiles) {

          if (err) {
            console.log(chalk.red(err.message));
            return;
          }
          subfiles.forEach(function(subrepo) {
            var data = fsp.readJSONSync(path.join(subdirname, subrepo));
            var _subrepo = [repo, path.dirname(subrepo)].join(path.sep);
            if (data) {
              configs[_subrepo] = data;
            }
          });

        });

        //glob('**/.efesconfig', {
        //    cwd: subdirname,
        //    sync: true
        //}, function(err, subfiles) {
        //    if (err) {
        //        console.log(chalk.red(err.message));
        //        return;
        //    }
        //    subfiles.forEach(function(subrepo) {
        //        var data = fsp.readJSONSync(path.join(subdirname, subrepo));
        //        var _subrepo = [repo, path.dirname(subrepo)].join(path.sep);
        //        if (data) {
        //            configs[_subrepo] = data;
        //        }
        //    });
        //});
      }
      callback();
    }, function() {

      if (!configs) {
        console.log('Lint is not configed.');
        return;
      }

      var filesLinted = 0;

      var lintErrors = 0;

      var imgErrors = [];

      var changedDir = [];

      files.some(function(fileStatus) {

        var _fileStatus = rFileStatus.exec(fileStatus);

        var filename = _fileStatus[2];
        var status = _fileStatus[1];

        var dirs = path.dirname(filename).split(path.sep);
        var config = getConfig(configs, dirs);
        var linter = config.lint;
        var suffix = path.extname(filename).slice(1);

        var _sublinter = null;

        if (/^(js|css)$/i.test(suffix) && linter) {
          _sublinter = linter[suffix];
        }

        if (changedDir.indexOf(config.baseDir) === -1) {
          changedDir.push(config.baseDir);
        }

        if (_sublinter) {
          filesLinted += 1;
          lintErrors += linters[_sublinter.engine](filename, path.join(process.cwd(), config.baseDir, _sublinter.config));
        }

        if (/^(x|d|s)?html?$/i.test(suffix)) {
          ckver.checkVer(filename);
        }

        if (/^(png|jpg|jpeg|gif)$/i.test(suffix)) {
          if (status !== 'A') {
            imgErrors.push(_fileStatus);
          }
        }
      });

      if (imgErrors.length > 0) {
        console.log(chalk.yellow("\n监测到下列图片有修改，请升级版本号后，重新 add 到 git 仓库中。\n"));
        var output = imgErrors.map(function(message) {
          var out = [];
          out.push(chalk.red(message[1]));
          out.push(message[2]);
          out.push(chalk.red('error'));
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
        console.log(output);
        console.log(chalk.red.bold('\n\u2716 ' + imgErrors.length + ' image version problems'));
      }

      if (filesLinted === 0) {
        console.log('No files needed to be linted');
      } else if (!lintErrors) {
        console.log('\n' + chalk.white.bgGreen.bold('No lint errors.'));
      }

      if (imgErrors.length === 0) {
        console.log('\n' + chalk.white.bgGreen.bold('No image version errors.'));
      }

      if (!lintErrors && imgErrors.length === 0) {
        console.log("\n" + chalk.white.bgGreen.bold('OKAY'));
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
      cwd: process.cwd()
    }, function(err, stdout) {
      if (err) {
        console.log(chalk.bold('Exception: ') + 'Not a git repo.');
      } else {
        if (stdout) {
          stdout = stdout.trim().split('\n');
          stdout = stdout.filter(function(fileStatus) {
            return fileStatus.indexOf('D') !== 0;
          });
          /*stdout = stdout.map(function(fileStatus) {
              return rFileStatus.exec(fileStatus)[1];
          });*/
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
