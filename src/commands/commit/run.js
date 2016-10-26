"use strict";

(function() {

  const async = require('async');
  const chalk = require('chalk');
  const childProcess = require('child_process');
  const fs = require('fs');
  const table = require('text-table');
  const minimatch = require("minimatch");
  const regexfiles = require('regex-files');

  const fsp = require('../../utils/fs');
  const path = require('../../utils/path.js');
  // const walk = require('../../utils/walk.js');

  const rFileStatus = /^([A-Z])\s+(.+)$/;

  const getConfig = function(configs, dirs) {
    let config = {};

    if (!dirs.length) {

      config = configs.root || {};
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

  const checkFiles = function(files, options) {

    let dirname = process.cwd();

    let configs = {};
    async.each(fs.readdirSync(dirname), function(repo, callback) {

      let subdirname = path.join(dirname, repo);
      let efesconfig = path.join(dirname, repo, '.efesconfig');
      let data;

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

        let regIncludes = [/\.efesconfig$/i];
        let regExcludes = [/node_modules/, /\.git/, /\.tmp/];

        regexfiles(subdirname, regExcludes, regIncludes, function(err, subfiles) {

          if (err) {
            console.log(chalk.red(err.message));
            return;
          }
          subfiles && subfiles.forEach(function(subrepo) {
            let data = fsp.readJSONSync(subrepo);
            if (data) {
              configs[path.dirname(subrepo)] = data;
            }
          });

        });
      }

      callback();
    }, function() {

      if (!configs) {
        console.log('没有配置 Lint 监测规则！');
        return;
      }

      let filesLinted = 0;

      let lintErrors = 0;

      let imgErrors = [];

      let changedDir = [];

      files.some(function(fileStatus) {

        let _fileStatus = rFileStatus.exec(fileStatus);

        let filename = _fileStatus[2];
        let status = _fileStatus[1];

        let dirs = path.dirname(filename).split(path.sep);
        let config = getConfig(configs, dirs);
        let linter = config.lint;
        let suffix = path.extname(filename).slice(1);

        let _sublinter = null;

        if (/^(js|css)$/i.test(suffix) && linter) {
          _sublinter = linter[suffix];
        }

        if (changedDir.indexOf(config.baseDir) === -1) {
          changedDir.push(config.baseDir);
        }

        if (_sublinter) {
          
          let isIgnore = false;

          // 剔除忽略lint检查的文件。
          if (_sublinter.ignore) {
            let _ignores = fsp.readFileSync(path.join(process.cwd(), config.baseDir, _sublinter.ignore));
            _ignores = _ignores.split('\n');
            _ignores.every(function(_ignore){
              _ignore = path.join(config.baseDir,_ignore);
              if (minimatch(filename, _ignore)) {
                isIgnore = true;
                return false;
              }
              return true;
            });
          }

          if (!isIgnore) {

            filesLinted += 1;

            let _cmd = `efes ${_sublinter.engine} --color -f ${filename} -c ${path.join(process.cwd(), config.baseDir, _sublinter.config)}`;
            //let _stdout = childProcess.execSync(_cmd).toString();// todo childProcess.execSync 比较消耗时间，有待优化
            //console.log(_stdout);
            //lintErrors = lintErrors || _stdout.indexOf('problems') !== -1;

            // 使用 childProcess.execSync(_cmd) 形式比较消耗时间，修改为require方式，
            // 尽管在代码级别产生了耦合，并不是efes设计之初的本意，但性能优先。
            lintErrors += require(`../${_sublinter.engine}/run`)({
              file: filename,
              config: path.join(process.cwd(), config.baseDir, _sublinter.config)
            });

          }

        }

        if (/^(x|d|s)?html?$/i.test(suffix)) {

          let _cmd = `efes ver -f ${filename} --color`;

          childProcess.execSync(_cmd, {
            stdio: 'inherit'
          });

        }

        if (/^(png|jpg|jpeg|gif)$/i.test(suffix)) {
          if (status !== 'A') {
            imgErrors.push(_fileStatus);
          }
        }
      });

      if (imgErrors.length > 0) {
        console.log(chalk.yellow("\n监测到下列图片有修改，请升级版本号后，重新 add 到 git 仓库中。\n"));

        let output = imgErrors.map(function(message) {
          let out = [];
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
        console.log('没有文件需要执行 lint 检查。');
      } else if (!lintErrors) {
        console.log('\n' + chalk.white.bgGreen.bold('没有 lint 错误。'));
      }

      if (imgErrors.length === 0) {
        console.log('\n' + chalk.white.bgGreen.bold('没有 image 版本错误。'));
      }

      if (!lintErrors && imgErrors.length === 0) {
        console.log("\n" + chalk.white.bgGreen.bold('OKAY'));
      }

      return lintErrors;
    });
  };

  module.exports = (options) => {

    console.log('开始 commit 检查...');

    childProcess.exec('git diff --name-status HEAD', {
      cwd: process.cwd()
    }, (err, stdout) => {
      if (err) {
        console.log(chalk.bold('异常: ') + '没有 git 提交。');
      } else {
        if (stdout) {
          stdout = stdout.trim().split('\n');
          stdout = stdout.filter((fileStatus) => {
            return fileStatus.indexOf('D') !== 0;
          });

          if (stdout.length) {
            checkFiles(stdout, options);
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
