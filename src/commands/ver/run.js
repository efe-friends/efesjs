"use strict";
/**
 * 1、检索当前目录下的所有文件（src, node_modules除外）。
 * 2、找到.html、.htm等文件，给这样文件中引用的js、css的url后添加 ‘?VERSION’ 字符串
 */
(function() {

  const async = require('async');
  const chalk = require('chalk');
  const regexfiles = require('regex-files');

  const path = require('../../utils/path.js');
  // const walk = require('../../utils/walk.js');

  const ver = require('./utils/ver.js');

  const singleFile = (file, dirname, isReplace, options) => {
    let illLength = 0;

    if (file) {

      if (isReplace) {

        ver.upVersion(file, dirname, options, (error, illSource) => {
          illLength += illSource ? illSource.length : 0;
        });

      } else {
        ver.checkVer(file, dirname, options, (error, illSource) => {
          illLength += illSource ? illSource.length : 0;
        });
      }
    }

    return illLength;

  };

  module.exports = function(options) {

    let isReplace = options.replace || false;

    if (isReplace) {

      console.log('\n添加/替换VERSION String...');

    } else {

      console.log('\n检查VERSION String...');

    }

    if (options.file) {

      let dirname = options.file.toString().match(/^\//) ? "/" : process.cwd();

      singleFile(options.file, dirname, isReplace, options);

    } else {

      let dirname = options.dir ? (options.dir.match(/^\//) ? options.dir : path.join(process.cwd(), options.dir)) : process.cwd();

      let regIncludes = [/\.(x|s|d)?html?$/i];

      let regExcludes = [/node_modules/, /\.git/, /\.tmp/];

      regexfiles(dirname, regExcludes, regIncludes, function(err, results) {

        if (err) {
          throw err;
        }

        let illLength = 0;

        async.each(results, function(repo, callback) {

          repo = path.relative(dirname, repo);

          let suffix = path.extname(repo).slice(1);

          if (suffix == 'jade') {

            console.log('jade');

          } else {

            illLength += singleFile(repo.replace(dirname, ""), dirname, isReplace, options);

          }

          callback();

        }, function() {
          if (illLength == 0) {
            console.log(chalk.green('虽然不想承认，但是真没找到需要添加/替换VERSION String的文件...'))
          }
        });

      });
    }



  };

})();
