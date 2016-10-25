"use strict";
(function() {

  const fs = require('fs');
  const async = require('async');
  const chalk = require('chalk');
  const regexfiles = require('regex-files');

  const fsp = require('./fs.js');
  // const walk = require('./walk.js');
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

        let _pathname = path.join(pathname.root, pathname.output);

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


  let matchPath = function(_path, _dirs, _global) {

    let dirname = process.cwd();

    if (!fs.statSync(_path).isDirectory() || _path == '.DS_Store') {
      return false;
    }

    let matched = false;

    let _tmpDir = null;

    _dirs.some(function(_dir) {

      let rPath = new RegExp(_path);
      // 为了区别 aaa/1234 和 aaa/12345 这种目录，需要在路径后面加 / 处理
      let _match = (_path + '\/').match(new RegExp(_dir.rewrite.root + '\/'));

      if (_path == _dir.rewrite.root) {
        _tmpDir = _dir;
        matched = true;
        return false;
      } else if (_match && _match.index === 0) {

        let _config = fsp.readJSONSync(path.join(dirname, _path, ".efesconfig"));

        let _subPath = _path.replace(new RegExp('^' + _dir.rewrite.root + '\/'), '');

        if (!_tmpDir || _tmpDir.matched.length < _dir.rewrite.root) {

          let _tmp = {
            config: _config,
            concatfile: _config ? path.join(dirname, _path, 'concatfile.json') : null,
            domain: {
              publish: _dir.domain.publish,
              dev: _dir.domain.dev
            },
            rewrite: {
              root: _path,
              request: `${_dir.rewrite.request}${_subPath.replace(/\\/g,'\/')}/`
            },
            matched: _dir.rewrite.root
          }

          _tmpDir = _tmp;
        }
      }

    });

    if (_tmpDir && !matched) {

      _dirs.push(_tmpDir);

    } else if (!matched) {

      let _config = fsp.readJSONSync(path.join(dirname, _path, ".efesconfig"));

      let _tmp = {
        config: _config,
        concatfile: _config ? path.join(dirname, _path, 'concatfile.json') : null,
        domain: {
          publish: _global.domain.publish,
          dev: _global.domain.dev
        },
        rewrite: {
          root: _path,
          request: `/${_path.replace(/\\/g,'\/')}/`
        },
        matched: _path
      }

      _dirs.push(_tmp);
    }

    return matched;

  };

  /**
   * 通过访问路径匹配本地路径
   */
  exports.loadLocalDir = function(spaceInfo, callback) {

    let dirname = process.cwd();
    let dirs = [];

    // 第一步 处理 efesproject.json 中配置的目录。
    spaceInfo.projects.some(function(_project) {

      let _dir = {
        config: null,
        concatfile: null,
        domain: {
          publish: null,
          dev: null
        },
        rewrite: {
          root: null,
          request: null
        },
        matched: null
      };

      _dir.domain.publish = (_project.domain && _project.domain.publish) || spaceInfo.global.domain.publish;
      _dir.domain.dev = (_project.domain && _project.domain.dev) || spaceInfo.global.domain.dev;

      let _config = fsp.readJSONSync(path.join(dirname, _project.rewrite.root, '.efesconfig'));

      _dir.config = _config;
      _dir.concatfile = _config ? path.join(dirname, _project.rewrite.root, 'concatfile.json') : null;

      _dir.rewrite.root = _project.rewrite.root;
      _dir.rewrite.request = _project.rewrite.request;

      // 匹配了那个目录的配置
      _dir.matched = _project.rewrite.root;

      dirs.push(_dir);

    });

    /*console.log(dirs);
    process.exit(0);*/

    // 第二步，处理获取当前目录下的所有子目录
    async.eachSeries(fs.readdirSync(dirname), function(repo, callback2) {

      let subdirname = path.join(dirname, repo);
      let efesconfig = path.join(dirname, repo, '.efesconfig');

      if (repo === '.efesconfig') {
        matchPath('/', dirs, spaceInfo.global);
      } else {
        matchPath(repo, dirs, spaceInfo.global);
      }

      let regIncludes = [/\.efesconfig$/i];
      let regExcludes = [/node_modules/, /\.git/, /\.tmp/];

      // 处理子目录下面配置了 .efesconfig 的目录
      regexfiles(subdirname, regExcludes, regIncludes, function(err, subfiles) {

        if (err) {
          console.log(chalk.red(err.message));
          callback2();
          return;
        }

        subfiles && subfiles.forEach(function(subrepo) {
          if (subrepo != '.efesconfig') { // 排除 步骤2 重复项
            matchPath(subrepo, dirs, spaceInfo.global);
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
   * @param  {[array]} spaceInfo [配置的项目信息]
   */
  exports.getLocalPathname = function(pathname, host, dirs, spaceInfo) {

    let dirname = process.cwd();

    let out = [];

    let dirLength = 0;

    dirs.forEach(function(_dir) {

      let dirLength2 = 0;

      // 先判断 host 是否和该目录相同。
      //console.log(host,_dir.domain.dev,_dir.domain.publish);
      if (_dir.domain.dev == host || _dir.domain.publish == host || rIP.test(host) || rLocalHost.test(host)) {
        // 其次判断 请求的路径 是否在这个目录下面。
        // 比如请求的路径是 /core/libs/zepto.min.js
        // 这个目录配置的路径是 /core/
        // 使用查找两个路径的相对路径进行匹配
        // 如果 /core/libs/zepto.min.js 是 /core/ 的下面的路径，则_relative中不包含 .. 这个操作。
        let _relative = path.relative(_dir.rewrite.request, pathname);

        if (_dir.rewrite.request && _relative.indexOf('..') === -1) {
          let localPathname = {
            root: path.join(dirname, _dir.rewrite.root),
            output: pathname.replace(_dir.rewrite.request, ''),
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
                    root: path.join(dirname, _dir.rewrite.root),
                    output: output,
                    input: input,
                    config: _dir.config
                  };
                }
              }
            }
          }

          // 在判断是这个目录下的时候，用正则判断匹配目录的长度，从而优先处理子目录的特殊配置
          let _dirLength = pathname.match(new RegExp(_dir.rewrite.request));

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
