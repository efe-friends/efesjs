(() => {

  const assign = require('object-assign');
  const gulp = require('gulp');

  const $ = require('gulp-load-plugins')();
  const through = require('through-gulp');

  const path = require('../path.js');

  module.exports = function(input, dir, options, callback) {

    let opts = assign({}, {
      compress: false,
      paths: []
    }, options);

    var browsers = [
      '> 1%',
      'last 2 versions',
      'Firefox ESR',
      'Opera 12.1'
    ];


    gulp.src(path.join(dir, input))
      .pipe($.plumber())
      .pipe($.less())
      .on('error', $.util.log)
      .pipe($.postcss([
        require('autoprefixer')({
          browsers: browsers
        })
      ]))
      .pipe(through(function(file) {
        callback(null, file.contents);
        return file;
      }));
  };
})();
