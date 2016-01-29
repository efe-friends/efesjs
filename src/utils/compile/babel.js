(function() {

  const assign = require('object-assign');
  const through = require('through-gulp');
  const gulp = require('gulp');
  const $ = require('gulp-load-plugins')();


  const path = require('../path.js');

  module.exports = function(input, dir, options, callback) {

    let opts = assign({}, {
      presets: ['es2015']
    }, options);

    opts = {
      presets: ["es2015"]
    };

    gulp.src(path.join(dir, input))
      .pipe($.plumber())
      .pipe($.babel({
        presets: ['es2015']
      }))
      .pipe(through(function(file) {
        callback(null, file.contents);
        return file;
      }));

  };

})();
