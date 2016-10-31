"use strict";
(function() {

  const fsp = require('./fs.js');
  const path = require('./path.js');
  const assign = require('deep-assign');
  const chalk = require('chalk');

  const findSpaceInfo = function(cwd = process.cwd()) {
    let spaceInfo = fsp.readJSONSync(path.join(cwd, 'efesproject.json'));
    if (spaceInfo) {

      spaceInfo.projects.map(function(_project) {
        let info = assign({}, _project);

        if (!info.domain) {
          info.domain = assign({}, spaceInfo.global.domain);
        } else {
          info.domain.publish = info.domain.publish || spaceInfo.global.domain.publish;
          info.domain.dev = info.domain.dev || spaceInfo.global.domain.dev;
        }

        if (info.git) {
          info.git = assign({}, spaceInfo.global.git, info.git);
        }

        return info;

      });

      return {
        baseDir: cwd,
        spaceInfo: spaceInfo
      };
    }

    if (cwd == path.sep) {
      return null;
    }

    return findSpaceInfo(path.join(cwd, '..'));

  };

  let env = findSpaceInfo();

  const getLocalDirInfo = function(dir) {

    let spaceInfo = env.spaceInfo;
    let dirname = env.baseDir;
    let info = {};
    let matchLength = 0;

    if (!spaceInfo) {
      global.efesecho.log('未找到efes工作目录配置文件：efeproject.json');
      return null;
    }

    spaceInfo.projects.some(function(_project) {

      let _root = path.join(dirname, _project.rewrite.root);

      // 使用查找两个路径的相对路径进行匹配
      // 如果dir是_root的子目录，则_relative中不包含 .. 这个操作。
      let _relative = path.relative(_root, dir);

      if (_relative.indexOf('..') === -1 && _root.length > matchLength) {
        matchLength = _root.length;
        info = assign({}, _project);
      }

    });

    if (!info.domain) {
      info.domain = spaceInfo.global.domain
    } else {
      info.domain.publish = info.domain.publish || spaceInfo.global.domain.publish;
      info.domain.dev = info.domain.dev || spaceInfo.global.domain.dev;
    }

    if (!info.rewrite) {
      // console.log(path.relative(dirname, dir), dir, dirname);
      info.rewrite = {
        root: path.relative(dirname, dir),
        request: '/' + path.relative(dirname, dir)
      }
    }

    let _rewriteRoot = path.join(info.rewrite.root, dir.replace(path.join(dirname, info.rewrite.root), ""));
    let _rewriteRequest = path.join(info.rewrite.request, _rewriteRoot.replace(info.rewrite.root, ""));

    info.rewrite = {
      root: _rewriteRoot,
      request: _rewriteRequest
    }

    return info;
  }

  const getRequestPathNameInfo = function(pathname, domain) {
    let spaceInfo = env.spaceInfo;
    let dirname = env.baseDir;
    let infos = [];
    let matchLength = 0;

    spaceInfo.projects.some(function(_project) {

      // 使用查找两个路径的相对路径进行匹配
      // 如果pathname是_project.rewrite.request的下面的路径，则_relative中不包含 .. 这个操作。
      // 不同于通过本地目录查找info，因为相同的访问根路径是可以配置给多个本地目录的，
      // 所以，这里返回的是一个数组。
      let _relative = path.relative(_project.rewrite.request, pathname);
      let info = {};
      if (domain == _project.domain.publish || domain == _project.domain.dev) {
        if (_relative.indexOf('..') === -1) {
          matchLength = _project.rewrite.request.length;
          info = assign({}, _project);

          if (_project.rewrite.request.length > matchLength) {
            infos = [info];
          } else if (_project.rewrite.request.length = matchLength) {
            infos.push(info);
          }

        }
      }

    });

    return info;

  }

  module.exports = {
    env: env,
    getLocalDirInfo: getLocalDirInfo,
    getRequestPathNameInfo: getRequestPathNameInfo
  }

})();
