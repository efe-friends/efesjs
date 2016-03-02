(function() {

  const gulp = require('gulp');

  const $ = require('gulp-load-plugins')();
  const fs = require('fs');
  const chalk = require('chalk');

  const through = require('through-gulp');
  const imageminWebp = require('imagemin-webp');

  const path = require('../path.js');

  module.exports = function(pathname, options, callback) {

    let devDir = pathname.config && pathname.config.dev_dir ? pathname.config.dev_dir : '';
    let publishDir = (pathname.config && pathname.config.publish_dir) ? pathname.config.publish_dir : './';
    
    publishDir = options.outpath || publishDir;

    let _pathname = path.join(pathname.localDir, devDir || '', pathname.output);

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

    console.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname));

    gulp.src(_pathname, {
        base: path.join(pathname.localDir, devDir || '')
      })
      .pipe($.plumber())
      .pipe(imageminWebp({
        quality: 50
      })())
      .on('error', $.util.log)
      .pipe($.if(options.publish && pathname.config, gulp.dest(publishDir, {
        cwd: pathname.localDir
      })))
      .pipe(through(function(file) {
        callback(null, file.contents);
        return file;
      }));
  };

})();
