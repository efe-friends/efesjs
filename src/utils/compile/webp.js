(function() {

  const gulp = require('gulp');

  const $ = require('gulp-load-plugins')();
  const fs = require('fs');
  const chalk = require('chalk');

  const through = require('through-gulp');
  const imageminWebp = require('imagemin-webp');

  const path = require('../path.js');

  module.exports = function(pathname, callback) {

    let _pathname = path.join(pathname.localDir, pathname.config.dev_dir || '', pathname.output);
    
    _pathname = $.util.replaceExtension(_pathname, '.png');

    if (!fs.existsSync(_pathname)) {
      _pathname = $.util.replaceExtension(_pathname, '.jpeg');
    }

    if (!fs.existsSync(_pathname)) {
      _pathname = $.util.replaceExtension(_pathname, '.jpg');
    }

    if (!fs.existsSync(_pathname)) {
      _pathname = $.util.replaceExtension(_pathname, '.gif');
    }

    console.log(chalk.yellow('src:')+' '+chalk.grey(_pathname));
    gulp.src(_pathname)
      .pipe($.plumber())
      .pipe(imageminWebp({
        quality: 50
      })())
      .on('error', $.util.log)
      .pipe(through(function(file) {
        callback(null, file.contents);
        return file;
      }));
  };

})();
