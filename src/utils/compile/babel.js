const fs = require('fs');
const chalk = require('chalk');
const gulp = require('gulp');

const objectAssign = require('object-assign');
const replaceExt = require('replace-ext');
const babel = require('babel-core');

const $ = require('gulp-load-plugins')();
const es2015 = require('babel-preset-es2015');
const react = require('babel-preset-react');
const through = require('through2');

const browserify = require('browserify');
const babelify = require('babelify');

const path = require('../path.js');
const rJsFile = /\.(babel|es6|es2015|jsx|js|coffee)$/i;
const rCssFile = /\.(less|css)$/i;
const rBabel = /\.babel$/i;
const rEs6 = /\.es(6|2015)$/i;
const rJsx = /\.jsx$/i;

// 兼容使用concatfile的方式合并jsx或es6时，使用browserify造成的多个闭包的错误。
// 使用browserify编译babel的时候，单个的文件会生成一个闭包包起来。
// 在以下情况下，不适用browserify编译babel:
// 文件a.es6和b.es6单独编译，通过全局变量进行引用。
// 这是就需要使用babel-core进行处理。
// jsx的情况相同。

function replaceExtension(fp) {
  return path.extname(fp) ? replaceExt(fp, '.js') : fp;
}

module.exports = function(opts) {

  let _opts = objectAssign({
    presets: [es2015]
  }, opts);

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new $.util.PluginError('babel', 'Streaming not supported'));
      return;
    }

    let contents = file.contents.toString();

    if (contents.indexOf('import ') !== -1 || contents.indexOf('export ') !== -1) {
      browserify({
          entries: [file.path],
          debug: true,
          extensions: ['', '.js', '.json', '.babel', '.jsx', '.es6', '.es2015']
        })
        .transform(babelify, {
          extensions: ['', '.js', '.babel', '.jsx', '.es6', '.es2015'],
          presets: _opts.presets
        })
        .bundle(function(err, res) {
          err && $.util.log(err.stack || err.message);
          if (res) {
            file.contents = res;
          } else {
            file.contents = new Buffer('');
          }
          this.push(file);
        });
    } else {

      try {
        var fileOpts = objectAssign({
          presets: _opts.presets
        }, {
          filename: file.path,
          filenameRelative: file.relative,
          sourceMap: Boolean(file.sourceMap),
          sourceFileName: file.relative,
          sourceMapTarget: file.relative
        });

        var res = babel.transform(file.contents.toString(), fileOpts);

        if (file.sourceMap && res.map) {
          res.map.file = replaceExtension(res.map.file);
          applySourceMap(file, res.map);
        }

        if (!res.ignored) {
          file.contents = new Buffer(res.code);
          file.path = replaceExtension(file.path);
        }

        file.babel = res.metadata;

        this.push(file);

      } catch (err) {
        this.emit('error', new $.util.PluginError('babel', err, {
          fileName: file.path,
          showProperties: false
        }));
      }
    }
    cb();
  });

};
