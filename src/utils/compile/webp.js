(function() {

  const gulp = require('gulp');

  const $ = require('gulp-load-plugins')();

  const through = require('through-gulp');
  const imageminWebp = require('imagemin-webp');

  const path = require('../path.js');

  module.exports = function(pathname, callback) {

    let _pathname = path.join(pathname.localDir, pathname.config.dev_dir || '', 'images', pathname.output);
    
    gulp.src($.util.replaceExtension(_pathname, '.png'))
      .pipe($.plumber())
      .pipe(imageminWebp({
        quality: 50
      })())
      .pipe(through(function(file) {
        callback(null, file.contents);
        return file;
      }));
  };

})();
