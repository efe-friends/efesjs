(function() {
  const fs = require('fs');
  const chalk = require('chalk');
  const gulp = require('gulp');
  const through = require('through-gulp');
  const $ = require('gulp-load-plugins')();
  const path = require('./path.js');
  const concat = require('./compile/concat.js');
  const html = require('./compile/html.js');
  const webp = require('./compile/webp.js');

  const rType = /\.(\w+)$/i;

  module.exports = function(pathConfig, options, callback) {
    if (typeof pathConfig === 'object' && pathConfig.root && pathConfig.input) {
      concat(pathConfig, options, function(err, data) {
        callback(err, data, pathConfig.output);
      });

    } else {
      let type = pathConfig.output.match(rType);

      if (type && type[0]) {

        switch (type[0].toLowerCase()) {

          case '.html': // jade会生成 .html 文件所以不需要特殊处理其他 .htm .shtml .xhtml .dhtml 这些文件
            html(pathConfig, options, function(err, data) {
              callback(err, data, pathConfig.output)
            });
            break;
          case '.webp': //
            webp(pathConfig, options, function(err, data) {
              callback(err, data, pathConfig.output)
            });
            break;
          default:

            let devDir = pathConfig.config && pathConfig.config.dev_dir ? pathConfig.config.dev_dir : '';
            let publishDir = pathConfig.config && pathConfig.config.publish_dir ? pathConfig.config.publish_dir : './';

            let _pathname = path.join(pathConfig.root, devDir || '', pathConfig.output);

            if (fs.existsSync(_pathname)) {
              global.efesecho.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname));
              gulp.src(_pathname, {
                  base: path.join(pathConfig.root, devDir || '')
                })
                .pipe($.if(options.publish && pathConfig.config, gulp.dest(publishDir, {
                  cwd: pathConfig.root
                })))
                .pipe(through(function(file) {
                  callback(null, file.contents);
                  return file;
                }));
              return;
            }

            _pathname = path.join(pathConfig.root, pathConfig.output);
            if (fs.existsSync(_pathname)) {
              gulp.src(_pathname)
                .pipe(through(function(file) {
                  callback(null, file.contents, pathConfig.output);
                  return file;
                }));
            } else {
              callback(new Error('文件或目录不存在:' + _pathname));
            }
            break;
        }
      } else {

        let _pathname = path.join(pathConfig.root, pathConfig.output);
        if (fs.existsSync(_pathname)) {
          gulp.src(_pathname)
            .pipe(through(function(file) {
              callback(null, file.contents, pathConfig.output);
              return file;
            }));
        } else {
          callback(new Error('文件或目录不存在:' + _pathname));
        }

      }
      callback();
    }

  };

})();
