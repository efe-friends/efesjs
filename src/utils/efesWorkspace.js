"use strict";
(function() {

  const fs = require('fs');
  const async = require('async');
  const chalk = require('chalk');

  const fsp = require('./fs.js');
  const walk = require('./walk.js');
  const path = require('./path.js');

  const readFile = require('./readFile.js');

  const rIP = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(:\d+)?$/;
  const rLocalHost = /^localhost(:\d+)?$/i;

  exports.tmpPublishDirForLocalDir = [];

  exports.tmpLocalEfesProjectDirs = null;

  exports.loadFile = function(pathnames, options, callback) {

    let _data, _errors = [];

    async.eachSeries(pathnames, function iterator(pathname, cb) {

      if (options.direct) {

        let _pathname = path.join(pathname.localDir, pathname.output);

        fs.readFile(_pathname, options, function(err, data) {
          if (err) {
            errors.push(err.message);
            cb();
          }

          if (data) {
            callback(null, data, _pathname);
            cb();
          }
        });

      } else {

        readFile(pathname, options, function(err, data) {

          if (err) {
            _errors.push(err.message);
            cb();
          }

          if (data) {
            _data = data;
            callback(null, data, pathname);
            cb();
          }

        });

      }

    }, function() {

      if (!_data && _errors.length > 0) {
        callback(_errors);
      }

    });

  };


  /**
   * 通过访问路径匹配本地路径
   */
  exports.loadLocalDir = function(projects, callback) {

    let dirname = process.cwd();
    let dirs = [];

    // 获取当前目录下的所有子目录
    async.eachSeries(fs.readdirSync(dirname), function(repo, callback2) {

      let subdirname = path.join(dirname, repo);
      let efesconfig = path.join(dirname, repo, '.efesconfig');

      if (repo === '.efesconfig') {

        /*dirs.push({
          "localDir": "/",
          "concatfile": fsp.readJSONSync(path.join(dirname, "concatfile.json")),
          "config": fsp.readJSONSync(path.join(dirname, ".efesconfig"))
        });*/

        dirs.push({
          "localDir": "/",
          "concatfile": path.join(dirname, "concatfile.json"),
          "config": fsp.readJSONSync(path.join(dirname, ".efesconfig"))
        });

      } else if (fs.existsSync(efesconfig)) { // 步骤2

        /*dirs.push({
          "localDir": repo,
          "concatfile": fsp.readJSONSync(path.join(dirname, repo, "concatfile.json")),
          "config": fsp.readJSONSync(path.join(dirname, repo, ".efesconfig"))
        });*/

        dirs.push({
          "localDir": repo,
          "concatfile": path.join(dirname, repo, "concatfile.json"),
          "config": fsp.readJSONSync(path.join(dirname, repo, ".efesconfig"))
        });

      } else if (fs.statSync(subdirname).isDirectory()) {

        dirs.push({
          "localDir": repo,
          "concatfile": null,
          "config": null
        });

      }

      let regIncludes = [/\.efesconfig$/i];
      let regExcludes = [/node_modules/, /\.git/, /\.tmp/];

      // 处理子目录下面配置了 .efesconfig 的目录
      walk(subdirname, regIncludes, regExcludes, function(err, subfiles) {

        if (err) {
          console.log(chalk.red(err.message));
          callback2();
          return;
        }

        subfiles.forEach(function(subrepo) {

          let _subrepo = [repo, path.dirname(subrepo)].join(path.sep);

          if (subrepo != '.efesconfig') { // 排除 步骤2 重复项
            let _concatfile = fsp.readJSONSync(path.join(dirname, _subrepo, "concatfile.json"));
            let _config = fsp.readJSONSync(path.join(dirname, _subrepo, ".efesconfig"))

            /*dirs.push({
              "localDir": _subrepo,
              "concatfile": _concatfile,
              "config": _config
            });*/

            dirs.push({
              "localDir": _subrepo,
              "concatfile": path.join(dirname, _subrepo, "concatfile.json"),
              "config": _config
            });

          }

        });

        callback2();

      });

    }, function() {

      callback(dirs);

    });

  };

  /**
   * 根据请求路径查找本地文件路径
   * @param  {[string]} pathname [访问路径]
   * @param  {[string]} host     [访问域名]
   * @param  {[array]} dirs     [根据配置的项目信息和当前目录下所有efes项目的信息，获得的目录匹配关系]
   * @param  {[array]} projects [配置的项目信息]
   */
  exports.getLocalPathname = function(pathname, host, dirs, projects) {

    let dirname = process.cwd();

    let out = [];

    let dirLength = 0;

    dirs.forEach(function(_dir) {

      let dirLength2 = 0;

      projects.projects.some(function(_project) {

        let _dirLength2 = _dir.localDir.match(new RegExp(_project.localDir));

        _dirLength2 = _dirLength2 ? _dirLength2[0].length : 0;

        if (_dirLength2 > dirLength2) {

          dirLength2 = _dirLength2;

          _dir.publishDir = (_project.publishDir + _dir.localDir.replace(_project.localDir, '').replace(/^\//, '')).replace(/\/$/, '') + '/';
          _dir.devDomain = _project.devDomain ? _project.devDomain : projects.devDomain;
          _dir.publishDomain = _project.publishDomain ? _project.publishDomain : projects.publishDomain;

        }

      });

      if (!_dir.publishDir) {
        _dir.publishDir = '/' + _dir.localDir + '/';
        _dir.devDomain = projects.devDomain;
        _dir.publishDomain = projects.publishDomain;
      }

      // 先判断 host 是否和该目录相同。
      if (_dir.devDomain == host || _dir.publishDomain == host || rIP.test(host) || rLocalHost.test(host)) {
        // 其次判断 请求的路径 是否在这个目录下面。
        // 比如请求的路径是 /core/libs/zepto.min.js
        // 这个目录配置的路径是 /core/
        // 则 pathname.indexOf(_dir.publishDir) 返回 0；
        // 表示 请求的文件 在这个目录下面。
        if (_dir.publishDir && pathname.indexOf(_dir.publishDir) === 0) {

          //let localPathname = path.join(dirname, _dir.localDir, pathname.replace(_dir.publishDir, ''));
          let localPathname = {
            localDir: path.join(dirname, _dir.localDir),
            output: pathname.replace(_dir.publishDir, ''),
            config: _dir.config
          };

          // 查找到有配置了合并规则的目录，对指定了合并规则的文件赋值合并来源
          if (_dir.concatfile) {

            let _concatfile = fsp.readJSONSync(_dir.concatfile);

            if (_concatfile) {

              for (let output in _concatfile.pkg) {
                let input = _concatfile.pkg[output];

                if (output === localPathname.output) {

                  localPathname = {
                    localDir: path.join(dirname, _dir.localDir),
                    output: output,
                    input: input,
                    config: _dir.config
                  };

                }
              }
            }

          }

          // 在判断是这个目录下的时候，用正则判断匹配目录的长度，从而优先处理子目录的特殊配置
          let _dirLength = pathname.match(new RegExp(_dir.publishDir));

          _dirLength = _dirLength ? _dirLength[0].length : 0;

          // 由于存在一个请求路径配置多个本地目录的情况，这里需要处理一下。
          if (_dirLength > dirLength) {
            // 如果最新的匹配长度，比先有的长度要长，则更新本地路径，同时更新匹配长度。
            dirLength = _dirLength;
            out = [localPathname];

          } else if (_dirLength == dirLength) {
            // 如果匹配长度和最长的一样，则push进本地路径列表中。
            out.push(localPathname);
          }


        }
      }

    });

    return out;

  };

})();
