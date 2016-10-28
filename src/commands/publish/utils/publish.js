"use strict";
(function() {

  const chalk = require('chalk');
  const gulp = require('gulp');
  const fs = require('fs');
  const childProcess = require('child_process');
  const async = require('async');
  const $ = require('gulp-load-plugins')();
  const imageminWebp = require('imagemin-webp');
  const pngquant = require('imagemin-pngquant');

  const fsp = require('../../../utils/fs.js');
  const path = require('../../../utils/path.js');

  // const work = require('../../../utils/efesWorkspace.js');

  const epc = require('../../../utils/efesProjectConfigs.js');
  const reqMatchToLocalPath = require('../../../utils/reqMatchToLocalPath.js');
  const buildResBody = require('../../../utils/buildResBody.js');

  const echoLog = function(file) {
    global.efesecho.log(chalk.green('发布：'), file.relative || file.path);
    return true;
  };

  const step1 = function(dirname, config, publishDir, options) {
    global.efesecho.log(chalk.green('开始将图片转换为webp格式...'));
    // 第一步处理图片 webp
    gulp.src([path.join(dirname, config.dev_dir) + '/**/*.+(jpg|jpeg|png|gif)',
        "!" + path.join(dirname, config.dev_dir) + '/**/icons/*.png'
      ])
      .pipe($.plumber())
      .pipe(imageminWebp({
        quality: 50
      })())
      .on('error', $.util.log)
      .on('end', function() {
        step2(dirname, config, publishDir, options);
      })
      .pipe($.if(options.publish && config && echoLog, gulp.dest(publishDir, {
        cwd: dirname
      })));
  };

  const step2 = function(dirname, config, publishDir, options) {
    global.efesecho.log(chalk.green('开始压缩图片...'));
    // 第二步处理图片 压缩
    gulp.src([path.join(dirname, config.dev_dir) + '/**/*.+(jpg|jpeg|png|gif)',
        "!" + path.join(dirname, config.dev_dir) + '/**/icons/*.png'
      ])
      .pipe($.plumber())
      .pipe($.imagemin({
        progressive: true,
        svgoPlugins: [{
          removeViewBox: false
        }],
        use: [pngquant()]
      }))
      .on('error', $.util.log)
      .on('end', function() {
        step3(dirname, config, publishDir, options);
      })
      .pipe($.if(options.publish && config && echoLog, gulp.dest(publishDir, {
        cwd: dirname
      })));
  };

  const step3 = function(dirname, config, publishDir, options) {
    global.efesecho.log(chalk.green('开始编译jade文件...'));
    // 第三步处理jade
    gulp.src(path.join(dirname, config.dev_dir) + '/**/*.jade')
      .pipe($.plumber())
      .pipe($.jade({
        pretty: true
      }))
      .on('error', $.util.log)
      .on('end', function() {
        step4(dirname, config, publishDir, options);
      })
      .pipe($.if(options.publish && config && echoLog, gulp.dest(publishDir, {
        cwd: dirname
      })));

  };

  const step4 = function(dirname, config, publishDir, options) {
    global.efesecho.log(chalk.green('开始复制处理其他文件...'));

    const condition = function(file) {
      if (!options.publish || !config || fs.statSync(file.path).isDirectory()) {
        return false;
      }
      global.efesecho.log(chalk.green('发布：'), file.relative || file.path);
      return true;
    };

    // 第四步处理其他文件
    let concatfile = fsp.readJSONSync(path.join(dirname, 'concatfile.json'));
    let outPublishFile = '/**/*.+(jsx|less|sass|scss|coffee|babel|es2015|es6)';
    if (concatfile) {
      outPublishFile = '/**/*.+(js|css|jsx|less|sass|scss|coffee|babel|es2015|es6)';
    }
    gulp.src([
        path.join(dirname, config.dev_dir) + '/**/*',
        "!" + path.join(dirname, config.dev_dir) + outPublishFile,
        "!" + path.join(dirname, config.dev_dir) + '/**/*.+(jpg|jpeg|png|gif)',
        "!" + path.join(dirname, config.dev_dir) + '/**/icons/*.png',
        "!" + path.join(dirname, config.dev_dir) + '/**/*.jade',
      ])
      .on('end', function() {
        step5(options);
      })
      .pipe($.if(condition, gulp.dest(publishDir, {
        cwd: dirname
      })));
  };

  const step5 = function(options) {
    if (options.all || options.message) {
      global.efesecho.log(chalk.green('开始提交git仓库...'));
      let _cmd = 'git commit -am ' + options.message;
      if (!options.all) {
        _cmd = 'git commit -m ' + options.message;
      }

      if (!options.message) {
        _cmd = 'git commit -a';
      }

      try {
        let stdout = childProcess.execSync(_cmd, {
          stdio: 'inherit'
        });
      } catch(e) {
        global.efesecho.log(e);
      }
    }
  };

  module.exports = function(dirname, options) {

    let config = fsp.readJSONSync(path.join(dirname, '.efesconfig'));
    let concatfile = fsp.readJSONSync(path.join(dirname, 'concatfile.json'));

    let publishDir = config.publish_dir || './';

    publishDir = options.outpath || publishDir;

    // 第零步处理css、js
    if (concatfile.pkg) {

      /*for (let output in concatfile.pkg) {
        work.loadFile([{
          root: dirname,
          output: output,
          input: concatfile.pkg[output],
          config: config
        }], options, function(err, filedata, local) {

          console.log(chalk.green('发布：'), output);

        });
      }*/
      global.efesecho.log(chalk.green('开始编译、合并js、css文件...'));
      async.forEachOfSeries(concatfile.pkg, function(input, output, cb) {
        buildResBody.build([{
          root: dirname,
          output: output,
          input: input,
          config: config
        }], options, function(err, filedata, local) {
          global.efesecho.log(chalk.green('发布：'), output);
          cb();
        });

        // work.loadFile([{
        //   root: dirname,
        //   output: output,
        //   input: input,
        //   config: config
        // }], options, function(err, filedata, local) {
        //   console.log(chalk.green('发布：'), output);
        //   cb();
        // });

      }, function(err) {
        err && config.log(err);
        step1(dirname, config, publishDir, options);
      });

    } else {
      step1(dirname, config, publishDir, options);
    }

  };

})();
