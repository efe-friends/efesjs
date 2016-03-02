"use strict";
(function() {

  const chalk = require('chalk');
  const gulp = require('gulp');
  const fs = require('fs');
  const $ = require('gulp-load-plugins')();
  const imageminWebp = require('imagemin-webp');
  const pngquant = require('imagemin-pngquant');

  const fsp = require('../../../utils/fs.js');
  const path = require('../../../utils/path.js');

  const work = require('../../../utils/efesWorkspace.js');

  module.exports = function(dirname, options) {

    let config = fsp.readJSONSync(path.join(dirname, '.efesconfig'));
    let concatfile = fsp.readJSONSync(path.join(dirname, 'concatfile.json'));

    // 第一步处理css、js
    if (concatfile.pkg) {

      for (let output in concatfile.pkg) {
        work.loadFile([{
          localDir: dirname,
          output: output,
          input: concatfile.pkg[output],
          config: config
        }], options, function(err, filedata, local) {

          console.log(chalk.green('发布：'), output);

        });
      }

    }

    let publishDir = config.publish_dir || './';

    publishDir = options.outpath || publishDir;

    const echoLog = function(file) {
      console.log(chalk.green('发布：'), file.relative||file.path);
      return true;
    };

    // 第二步处理图片
    gulp.src(path.join(dirname, config.dev_dir) + '/**/*.+(jpg|jpeg|png|gif)')
      .pipe($.plumber())
      .pipe(imageminWebp({
        quality: 50
      })())
      .on('error', $.util.log)
      .pipe($.if(options.publish && config && echoLog, gulp.dest(publishDir, {
        cwd: dirname
      })));

    gulp.src(path.join(dirname, config.dev_dir) + '/**/*.+(jpg|jpeg|png|gif)')
      .pipe($.plumber())
      .pipe($.imagemin({
        progressive: true,
        svgoPlugins: [{
          removeViewBox: false
        }],
        use: [pngquant()]
      }))
      .on('error', $.util.log)
      .pipe($.if(options.publish && config && echoLog, gulp.dest(publishDir, {
        cwd: dirname
      })));

    // 第三步处理jade
    gulp.src(path.join(dirname, config.dev_dir) + '/**/*.jade')
      .pipe($.plumber())
      .pipe($.jade({
        pretty: true
      }))
      .on('error', $.util.log)
      .pipe($.if(options.publish && config && echoLog, gulp.dest(publishDir, {
        cwd: dirname
      })));


    const condition = function(file) {
      if (!options.publish || !config || fs.statSync(file.path).isDirectory()) {
        return false;
      }
      console.log(chalk.green('发布：'), file.relative||file.path);
      return true;
    };

    // 第四步处理其他文件
    gulp.src([
        path.join(dirname, config.dev_dir) + '/**/*',
        "!" + path.join(dirname, config.dev_dir) + '/**/*.+(js|css|jsx|sass|scss|coffee|babel|es2015|es6)',
        "!" + path.join(dirname, config.dev_dir) + '/**/*.+(jpg|jpeg|png|gif)',
        "!" + path.join(dirname, config.dev_dir) + '/**/*.jade',
      ])
      .pipe($.if(condition, gulp.dest(publishDir, {
        cwd: dirname
      })));

  };

})();
