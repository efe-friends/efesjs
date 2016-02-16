(function() {

  const gulp = require('gulp');
  const fs = require('fs');
  const chalk = require('chalk');

  const $ = require('gulp-load-plugins')();
  const through = require('through-gulp');

  const path = require('../path.js');

  module.exports = function(pathname, callback) {

    if (!pathname.config) {
      let _pathname = path.join(pathname.localDir, pathname.output);
      if (fs.existsSync(_pathname)) {
        gulp.src(_pathname)
          .pipe(through(function(file) {
            callback(null, file.contents);
            return file;
          }));
      } else {
        callback(new Error('文件或目录不存在:' + _pathname));
      }
      return;
    }

    // 寻找开发目录下的jade文件
    let _pathname = path.join(pathname.localDir, pathname.config.dev_dir || '', pathname.output.replace(/\.html$/i, '.jade'));

    if (fs.existsSync(_pathname)) {
      console.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname));
      return gulp.src(_pathname)
        .pipe($.plumber())
        .pipe($.jade({
          pretty: true
        }))
        .on('error', $.util.log)
        .pipe(through(function(file) {
          callback(null, file.contents);
          return file;
        }));
      return;
    }

    // 寻找开发目录下jade目录下的jade文件
    _pathname = path.join(pathname.localDir, pathname.config.dev_dir || '', 'jade', pathname.output.replace(/\.html$/i, '.jade'));

    if (fs.existsSync(_pathname)) {
      console.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname));
      return gulp.src(_pathname)
        .pipe($.plumber())
        .pipe($.jade({
          pretty: true
        }))
        .on('error', $.util.log)
        .pipe(through(function(file) {
          callback(null, file.contents);
          return file;
        }));
      return;
    }

    // 寻找开发目录下的html文件
    _pathname = path.join(pathname.localDir, pathname.config.dev_dir || '', pathname.output);

    // 寻找开发目录下html目录下的文件
    if (!fs.existsSync(_pathname)) {
      _pathname = path.join(pathname.localDir, pathname.config.dev_dir || '', 'html', pathname.output);
    }

    // 寻找发布目录下的html文件
    if (!fs.existsSync(_pathname)) {
      _pathname = path.join(pathname.localDir, pathname.config.publish_dir || '', pathname.output);
    }

    if (fs.existsSync(_pathname)) {
      console.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname));
      gulp.src(_pathname)
        .pipe(through(function(file) {
          callback(null, file.contents);
          return file;
        }));
    } else {
      callback(new Error('文件或目录不存在:' + _pathname));
    }
  };

})();
