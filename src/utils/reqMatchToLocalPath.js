import fs from 'fs';
import chalk from 'chalk';
import md5 from 'md5';

import fsp from './fs.js';
import path from './path.js';

let catchMatchedPathConfigs = [];

function doMatch(requestPath, projectConfigs) {
  let efesSpaceDirname = process.cwd();
  let _matchedPathConfigs = [];

  projectConfigs && projectConfigs.some(function(projectConfig){
    let matchedPathConfig = {
      root: path.join(efesSpaceDirname, projectConfig.rewrite.root),
      output: path.relative(projectConfig.rewrite.request, requestPath),
      config: projectConfig.config
    };

    // 查找到有配置了合并规则的目录，对指定了合并规则的文件赋值合并来源
    if (projectConfig.concatfile) {
      let _concatfile = fsp.readJSONSync(projectConfig.concatfile);
      if (_concatfile) {
        for (let output in _concatfile.pkg) {
          let input = _concatfile.pkg[output];
          if (output === matchedPathConfig.output) {
            matchedPathConfig = {
              root: path.join(efesSpaceDirname, projectConfig.rewrite.root),
              output: output,
              input: input,
              config: projectConfig.config
            };
          }
        }
      }
    }
    _matchedPathConfigs.push(matchedPathConfig);
  });

  return _matchedPathConfigs;
}

export function match(requestHost, requestPath, projectConfigs) {

  let matchedPathConfigs = catchMatchedPathConfigs[md5(requestHost + '/' + requestPath)];

  if (!matchedPathConfigs) {
    // 由于需要支持 一个根访问路径 可以配置多个 本地目录，
    // 所以匹配出来的本地路径有可能会有多个。
    // todo 每个查找在第一次大约要使用300ms，有待优化
    let _matchedPathConfigs = doMatch(requestPath, projectConfigs);
    // 将已经查找到的路径对应关系缓存起来，方便下次调用。
    catchMatchedPathConfigs[md5(requestHost + '/' + requestPath)] = _matchedPathConfigs;

    return _matchedPathConfigs;

  } else {
    // 更新 concatfile 中的信息
    matchedPathConfigs.map(function(pathConfig) {
      let _concatfile = fsp.readJSONSync(path.join(pathConfig.root, 'concatfile.json'));
      if (_concatfile) {
        for (let output in _concatfile.pkg) {
          let input = _concatfile.pkg[output];
          if (output === pathConfig.output) {
            pathConfig.output = output;
            pathConfig.input = input;
            return pathConfig;
          }
        }
      }
    });
  }

  return matchedPathConfigs;
}