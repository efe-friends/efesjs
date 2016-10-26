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

  module.exports = function(pathname, options, callback) {
    if (typeof pathname === 'object' && pathname.root && pathname.input) {
      concat(pathname, options, function(err, data) {
        callback(err, data, pathname.output);
      });

    } else {

      let type = pathname.output.match(rType);

      if (type && type[0]) {

        switch (type[0].toLowerCase()) {

          case '.html': // jade会生成 .html 文件所以不需要特殊处理其他 .htm .shtml .xhtml .dhtml 这些文件
            html(pathname, options, function(err, data) {
              callback(err, data, pathname.output)
            });
            break;
          case '.webp': //
            webp(pathname, options, function(err, data) {
              callback(err, data, pathname.output)
            });
            break;
          default:

            
            let devDir = pathname.config && pathname.config.dev_dir ? pathname.config.dev_dir : '';
            let publishDir = pathname.config && pathname.config.publish_dir ? pathname.config.publish_dir : './';

            let _pathname = path.join(pathname.root, devDir || '', pathname.output);

            if (fs.existsSync(_pathname)) {
              global.efesecho.log(chalk.yellow('src:') + ' ' + chalk.grey(_pathname));
              gulp.src(_pathname, {
                  base: path.join(pathname.root, devDir || '')
                })
                .pipe($.if(options.publish && pathname.config, gulp.dest(publishDir, {
                  cwd: pathname.root
                })))
                .pipe(through(function(file) {
                  callback(null, file.contents);
                  return file;
                }));
              return;
            }

            _pathname = path.join(pathname.root, pathname.output);
            if (fs.existsSync(_pathname)) {
              gulp.src(_pathname)
                .pipe(through(function(file) {
                  callback(null, file.contents, pathname.output);
                  return file;
                }));
            } else {
              callback(new Error('文件或目录不存在:' + _pathname));
            }
            break;
        }
      } else {

        let _pathname = path.join(pathname.root, pathname.output);
        if (fs.existsSync(_pathname)) {
          gulp.src(_pathname)
            .pipe(through(function(file) {
              callback(null, file.contents, pathname.output);
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
