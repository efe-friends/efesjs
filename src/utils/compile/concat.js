(function() {
  const fs = require('fs');
  const chalk = require('chalk');
  const gulp = require('gulp');
  const webpack = require('webpack-stream');

  const $ = require('gulp-load-plugins')();
  const es2015 = require('babel-preset-es2015');
  const react = require('babel-preset-react');
  const through = require('through-gulp');

  const path = require('../path.js');
  const rJsFile = /\.(babel|es6|es2015|jsx|js|coffee)$/i;
  const rCssFile = /\.(less|css)$/i;
  const rBabel = /\.babel$/i;
  const rEs6 = /\.es(6|2015)$/i;
  const rJsx = /\.jsx$/i;
  const rCoffee = /\.coffee$/i;
  const rLess = /\.less$/i;
 /* const rSass = /\.sass$/i;
  const rScss = /\.scss$/i;*/
  const rCss = /\.css$/i;

  module.exports = function(pathname, options, callback) {

    let srcs = pathname.input;

    let isPipe = false;

    let beforeConcatPipe = through(function(file, encoding, callback) {
      this.push(file);
      callback();
    }, function(callback) {
      callback();
    });

    if (srcs.beforeConcatPipe) {
      isPipe = true;
      beforeConcatPipe = require(path.join(pathname.root, srcs.beforeConcatPipe))();
    }

    if (!Array.isArray(srcs) && srcs.input && Array.isArray(srcs.input)) {
      srcs = srcs.input;
    }

    srcs = srcs.map(function(src) {

      let _root = pathname.root;
      if (src.match(/(^\/|^!\/)/)) {
        _root = process.cwd();
      }

      let _src = path.join(_root, src);

      if (src.match(/^!/)) {
        _src = "!" + path.join(_root, src.replace(/^!/,''));
      }

      if (!src.match(/^!/)) {
        try {
          fs.accessSync(_src);
        } catch(e) {
          console.log(chalk.yellow('文件不存在或为匹配规则：') + _src);
        }
      }

      return _src;
    });

    let browsers = [
      '> 1%',
      'last 2 versions',
      'Firefox ESR',
      'Opera 12.1'
    ];

    let devDir = pathname.config && pathname.config.dev_dir ? pathname.config.dev_dir : '';
    let publishDir = (pathname.config && pathname.config.publish_dir) ? pathname.config.publish_dir : './';

    publishDir = options.outpath || publishDir;

    if (/\.css$/i.test(pathname.output)) {
      gulp.src(srcs)
        .pipe($.plumber())
        .pipe($.if(rLess, $.less()))
        /*.pipe($.if(rScss, $.sass()))
        .pipe($.if(rSass, $.sass()))*/
        .pipe($.postcss([
          require('autoprefixer')({
            browsers: browsers
          })
        ]))
        .pipe($.if(isPipe, beforeConcatPipe))
        .pipe($.if(!options.publish,through(function(file,enc,cb){
          let contents = file.contents.toString();
          let _path = file.history && file.history[0];
          
          contents = "\n\n\n \/\*\* SOURCE: " + _path + "  \*\*\/\n\n\n" + contents;
          
          if (!_path.match(rCssFile)) {
            contents = "";
            console.log(chalk.yellow("非css文件：")+_path);
          }

          file.contents = new Buffer(contents)
          return cb(null,file);
        })))
        .pipe($.concat(pathname.output))
        .pipe($.if(options.compress, $.postcss([
          require('cssnano')()
        ])))
        .on('error', $.util.log)
        .pipe($.if(options.publish && pathname.config, gulp.dest(publishDir, {
          cwd: pathname.root
        })))
        .pipe(through(function(file) {
          callback(null, file.contents);
          return file;
        }));
      return;
    }

    if (/\.js$/i.test(pathname.output)) {

      /*gulp.src(srcs)
        .pipe($.plumber())
        .pipe(webpack())
        .pipe($.concat(pathname.output))
        .pipe($.if(options.compress, $.uglify()))
        .on('error', $.util.log)
        .pipe($.if(options.publish && pathname.config, gulp.dest(publishDir, {
          cwd: pathname.root
        })))
        .pipe(through(function(file) {
          callback(null, file.contents);
          return file;
        }));
      return;*/

      gulp.src(srcs)
        .pipe($.plumber())
        .pipe($.if(rBabel, $.babel({
          presets: [es2015] // es2015这个模块是一个加载起来很慢的模块，伤脑筋啊
        })))
        .pipe($.if(rEs6, $.babel({
          presets: [es2015] // es2015这个模块是一个加载起来很慢的模块，伤脑筋啊
        })))
        .pipe($.if(rJsx, $.babel({
          presets: [react, es2015]
        })))
        .pipe($.if(rCoffee, $.coffee()))
        .pipe($.if(isPipe, beforeConcatPipe))
        .pipe($.if(!options.publish,through(function(file,enc,cb){
          let contents = file.contents.toString();
          let _path = file.history && file.history[0];

          contents = "\/\*\* SOURCE: " + _path + "  \*\*\/\n\n\n" + contents + "\n\n\n";

          if (!_path.match(rJsFile)) {
            contents = "";
            console.log(chalk.yellow("非js文件：")+_path);
          }

          file.contents = new Buffer(contents);
          return cb(null,file);
        })))
        .pipe($.concat(pathname.output))
        .pipe($.if(options.compress, $.uglify()))
        .on('error', $.util.log)
        .pipe($.if(options.publish && pathname.config, gulp.dest(publishDir, {
          cwd: pathname.root
        })))
        .pipe(through(function(file,enc,cb) {
          callback(null, file.contents);
          return cb(null,file);
        }));
      return;
    }

    // 拆分 css 和 js 的处理，减少处理时间
    /*gulp.src(srcs)
      .pipe($.plumber())
      .pipe($.if(rBabel, $.babel({
        presets: ['es2015']
      })))
      .pipe($.if(rCoffee, $.coffee()))
      .pipe($.if(rLess, $.less()))
      .pipe($.if(rCss, $.postcss([
        require('autoprefixer')({
          browsers: browsers
        })
      ])))
      .on('error', $.util.log)
      .pipe($.concat(pathname.output))
      .pipe(through(function(file) {
        callback(null, file.contents);
        return file;
      }));*/
    //callback(null, '11111');
  };

})();
