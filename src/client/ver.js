"use strict";
/**
 * 1、检索当前目录下的所有文件（src, node_modules除外）。
 * 2、找到.html、.htm等文件，给这样文件中引用的js、css的url后添加 ‘?VERSION’ 字符串
 * 3、为图片增加版本号。
 */
(() => {

  const async = require('async');
  const chalk = require('chalk');
  const jsdom = require('jsdom');
  const url = require('url');
  const childProcess = require('child_process');
  const fs = require('fs');
  const fsp = require('../utils/fs');
  const path = require('../utils/path.js');
  const table = require('text-table');
  //const glob = require('glob-all');
  const walk = require('../utils/walk.js');

  const ckver = require('./model/version/ckver.js');

  exports.ver = function(options) {

    console.log('Adding VERSION string...');

    let dirname = process.cwd();

    //let files = glob.sync([ 
    //'**/*.{html,{s,x,d}html,htm,jade}',
    //  '!**/node_modules/**/*'
    //]);

    let regIncludes = [/\.(x|s|d)?html$/i];

    let regExcludes = [/node_modules/, /\.git/, /\.tmp/];

    walk(dirname, regIncludes, regExcludes, function(err, results) {

      if (err) {
        throw err;
      }

      async.each(results, function(repo, callback) {

        let suffix = path.extname(repo).slice(1);

        if (suffix == 'jade') {

          console.log('jade');

        } else {
          ckver.upVersion(repo, dirname);
        }

        callback();

      }, function() {

      });

    });

  };

})();
