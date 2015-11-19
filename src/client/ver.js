"use strict";
/**
 * 1、检索当前目录下的所有文件（src, node_modules除外）。
 * 2、找到.html、.htm等文件，给这样文件中引用的js、css的url后添加 ‘?VERSION’ 字符串
 */
(() => {

  const async = require('async');
  const chalk = require('chalk');
  const path = require('../utils/path.js');
  const walk = require('../utils/walk.js');

  const verString = require('./model/version/VersionString.js');

  exports.ver = function(options) {

    console.log('添加/替换VERSION String...');

    let dirname = process.cwd();

    //let files = glob.sync([ 
    //'**/*.{html,{s,x,d}html,htm,jade}',
    //  '!**/node_modules/**/*'
    //]);

    let regIncludes = [/\.(x|s|d)?html?$/i];

    let regExcludes = [/node_modules/, /\.git/, /\.tmp/];

    walk(dirname, regIncludes, regExcludes, function(err, results) {

      if (err) {
        throw err;
      }

      let illLength = 0;

      async.each(results, function(repo, callback) {

        let suffix = path.extname(repo).slice(1);

        if (suffix == 'jade') {

          console.log('jade');

        } else {
          verString.upVersion(repo, dirname, options, (error, illSource) => {
            illLength += illSource ? illSource.length : 0;
          });
        }

        callback();

      }, function() {
        if (illLength == 0) {
          console.log(chalk.green('虽然不想承认，但是真没找到需要添加/替换VERSION String的文件...'))
        }
      });

    });

  };

})();
