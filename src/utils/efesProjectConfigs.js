import fs from 'fs';
import chalk from 'chalk';
import regexfiles from 'regex-files';

import fsp from './fs.js';
import path from './path.js';

const rIP = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(:\d+)?$/;
const rLocalHost = /^localhost(:\d+)?$/i;

// const projectConfigTmp = {
//   config: null, // .efesconfig 文件内容
//   concatfile: null, // 合并规则
//   domain: {
//     publish: null,
//     dev: null
//   },
//   rewrite: {
//     root: null,
//     request: null
//   },
//   matched: null // 匹配的本地绝对路径
// };

/**
 * 获取两个路径 path1 现对于 path2 的匹配度
 * return 0 表示完全匹配
 */
// function matchLevel(path1, path2) {
//   var rel = path.relative(path2, path1);

//   if(!rel){
//     return 0;
//   }

// }

// export let tmpSpaceProjectConfigs = [];

// 查找efes工作空间下所有的 .efesconfig 文件
function findAllEfesConfigs(spaceDirname, callback) {
  let regExcludes = [/node_modules/, /\.git/, /\.tmp/, /\.DS_Store/];
  let regIncludes = [/\.efesconfig$/i];
  // 查找到efes工作空间下面所有含有 .efesconfig 的目录
  regexfiles(spaceDirname, regExcludes, regIncludes, function(err, subfiles) {
    if (err) {
      global.efesecho.log(chalk.red(err.message));
      callback(subfiles);
      return;
    }
    callback(subfiles);
  });
}

// 为所有的 efes 项目（含有 .efesconfig 的目录）补全配置信息。
function scanfProjectConfigs(efesconfigPath, spaceInfo, spaceDirname, spaceProjectConfigs) {

  let efesSpaceGlobalConfig = spaceInfo.global;

  let eDirname = path.relative(spaceDirname, path.dirname(efesconfigPath));

  if (!fs.statSync(eDirname).isDirectory()) {
    return false;
  }

  let matched = false;

  let _tmpDir = null;

  spaceProjectConfigs && spaceProjectConfigs.some(function(projectConfig) {

    let relativePath = path.relative(projectConfig.rewrite.root, eDirname);

    // 排除在 efesproject.josn 文件中已经配置的还有 .efesconfig 的目录。
    if(efesconfigPath.replace('.efesconfig','concatfile.json') == projectConfig.concatfile){
      matched = true;
      return false;
    }

    // 排除不是同一个路径下面的目录。
    if(relativePath.indexOf('..') >= 0) {
      matched = false;
      return false;
    }

    // console.log(efesconfigPath, chalk.red(eDirname), projectConfig.rewrite.root, chalk.green(relativePath));

    // 为了区别 aaa/1234 和 aaa/12345 这种目录，需要在路径后面加 / 处理
    let _match = (eDirname + '\/').match(new RegExp(projectConfig.rewrite.root + '\/'));

    if (eDirname == projectConfig.rewrite.root) {
      _tmpDir = projectConfig;
      matched = true;
      return false;
    // } else if (_match && _match.index === 0) {
    } else {

      let _config = fsp.readJSONSync(path.join(spaceDirname, eDirname, ".efesconfig"));

      let _subPath = path.relative(projectConfig.rewrite.root, eDirname);
      // let _subPath = _path.replace(new RegExp('^' + _dir.rewrite.root + '\/'), '');

      if (!_tmpDir || _tmpDir.matched.length < projectConfig.rewrite.root.length) {

        let _tmp = {
          config: _config,
          concatfile: _config ? path.join(spaceDirname, eDirname, 'concatfile.json') : null,
          domain: {
            publish: projectConfig.domain.publish,
            dev: projectConfig.domain.dev
          },
          rewrite: {
            root: eDirname,
            request: `${projectConfig.rewrite.request}${_subPath.replace(/\\/g,'\/')}/`
          },
          matched: projectConfig.rewrite.root
        }

        _tmpDir = _tmp;
      }
    }

  });

  if (_tmpDir && !matched) {

    spaceProjectConfigs.push(_tmpDir);

  } else if (!matched) {

    let _config = fsp.readJSONSync(path.join(spaceDirname, eDirname, ".efesconfig"));

    let _tmp = {
      config: _config,
      concatfile: _config ? path.join(spaceDirname, eDirname, 'concatfile.json') : null,
      domain: {
        publish: efesSpaceGlobalConfig.domain.publish,
        dev: efesSpaceGlobalConfig.domain.dev
      },
      rewrite: {
        root: eDirname,
        request: `/${eDirname.replace(/\\/g,'\/')}/`
      },
      matched: eDirname
    }

    spaceProjectConfigs.push(_tmp);
  }

  return matched;

};


// 为所有的 efes 空间配置信息（efesproject.json）中的 project 补全配置信息。
function scanfSpaceProjectConfigs(spaceInfo, spaceDirname) {
  
  let projectConfigs = [];

  let efesSpaceGlobalConfig = spaceInfo.global;

  // 第一步 处理 efesproject.json 中配置的目录。
  spaceInfo.projects && spaceInfo.projects.some(function(_project) {

    let projectConfig = {
      config: null, // .efesconfig 文件内容
      concatfile: null, // 合并规则
      domain: {
        publish: null,
        dev: null
      },
      rewrite: {
        root: null,
        request: null
      },
      matched: null // 匹配的本地绝对路径
    };

    projectConfig.domain.publish = (_project.domain && _project.domain.publish) || efesSpaceGlobalConfig.domain.publish;
    projectConfig.domain.dev = (_project.domain && _project.domain.dev) || efesSpaceGlobalConfig.domain.dev;

    let _config = fsp.readJSONSync(path.join(spaceDirname, _project.rewrite.root, '.efesconfig'));

    projectConfig.config = _config;
    projectConfig.concatfile = _config ? path.join(spaceDirname, _project.rewrite.root, 'concatfile.json') : null;

    projectConfig.rewrite.root = _project.rewrite.root;
    projectConfig.rewrite.request = _project.rewrite.request;

    // 匹配了那个目录的配置
    projectConfig.matched = _project.rewrite.root;
    projectConfigs.push(projectConfig);

  });
  // console.log(projectConfigs);

  projectConfigs.push({
    config: null, // .efesconfig 文件内容
    concatfile: null, // 合并规则
    domain: {
      publish: efesSpaceGlobalConfig.domain.publish,
      dev: efesSpaceGlobalConfig.domain.dev
    },
    rewrite: {
      root: './',
      request: '/'
    },
    matched: '/' // 匹配的本地绝对路径
  });

  return projectConfigs;
}


export function find(spaceInfo, spaceDirname, callback) {

  let spaceProjectConfigs = scanfSpaceProjectConfigs(spaceInfo, spaceDirname);

  findAllEfesConfigs(spaceDirname, function(efesconfigPaths){

    efesconfigPaths && efesconfigPaths.some(function(efesconfigPath){
      scanfProjectConfigs(efesconfigPath, spaceInfo, spaceDirname, spaceProjectConfigs, );
    });

    // console.log(spaceProjectConfigs);
    // process.exit(0);

    callback(spaceProjectConfigs);

  });

}

// 获取请求路径所匹配的项目配置文件
export function getProjectConfig(requestHost, requestPath, spaceInfo, spaceDirname, spaceProjectConfigs) {

  let efesSpaceGlobalConfig = spaceInfo.global;

  let matched = false;

  let _tmpConfigs = [];

  let reqDirname = path.dirname(requestPath);

  let lgTmp = []; // 匹配度更高的配置
  let eqTmp = []; // 匹配度相同的配置

  spaceProjectConfigs && spaceProjectConfigs.some(function(projectConfig) {

    if (projectConfig.domain.dev == requestHost || projectConfig.domain.publish == requestHost || rIP.test(requestHost) || rLocalHost.test(requestHost)) {
      
      let relativePath = path.relative(projectConfig.rewrite.request, reqDirname);

      if(relativePath.indexOf('..') >= 0) {
        matched = false;
        return false;
      }

      // console.log(requestPath, chalk.red(reqDirname), projectConfig.rewrite.request, chalk.green(relativePath));

      let _match = reqDirname.match(new RegExp(projectConfig.rewrite.request));
      
      if (reqDirname == projectConfig.rewrite.request) {
        _tmpConfigs = [projectConfig];
        return true;
      // } else if (_match && _match.index === 0) {
      } else {
        // console.log(_match);
        if(!_tmpConfigs || _tmpConfigs.length == 0) {
          _tmpConfigs.push(projectConfig);
        }

        if (_tmpConfigs && _tmpConfigs.length > 0) {
          _tmpConfigs.some(function(_tmpConfig) {
            if(_tmpConfig.rewrite.request.length < projectConfig.rewrite.request.length){
              lgTmp = [projectConfig];
              eqTmp = [];
            }else if(_tmpConfig.rewrite.request.length == projectConfig.rewrite.request.length){
              eqTmp.push(projectConfig);
            }
          });
        }
      }
    }

  });

  if(lgTmp && lgTmp.length > 0){
    _tmpConfigs = lgTmp;
  } else if(eqTmp && eqTmp.length > 0){
    _tmpConfigs = eqTmp;
  }

  if (_tmpConfigs && !matched) {
    let isRoot = false;
    _tmpConfigs.some(function(configs){
      if(configs.rewrite.request == '/') {
        isRoot = true;
      }
    });

    if(isRoot) {
      let configDirname = reqDirname;
      let _config = null;
      while(configDirname != '/' && !_config ) {
        // console.log(configDirname);
        // console.log('========', configDirname, path.join(spaceDirname, configDirname, ".efesconfig"));
        _config = fsp.readJSONSync(path.join(spaceDirname, configDirname, ".efesconfig"));
        if(!_config) {
          configDirname = path.join(configDirname, '..');
        }
      }
      if(_config) {
        let _tmp = {
          config: _config,
          concatfile: _config ? path.join(spaceDirname, configDirname, 'concatfile.json') : null,
          domain: {
            publish: efesSpaceGlobalConfig.domain.publish,
            dev: efesSpaceGlobalConfig.domain.dev
          },
          rewrite: {
            root: configDirname,
            request: `/${configDirname.replace(/\\/g,'\/')}/`
          },
          matched: configDirname
        }

        spaceProjectConfigs.push(_tmp);
        return [_tmp];
      }
    }
    return _tmpConfigs;
  }
}