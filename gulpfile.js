/*jsHint: global -$  require */
'use strict';

// generated on 2015-06-05 using generator-gulp-webapp 0.3.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('jshint', function() {
  return gulp.src('lib/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('dev', ['jshint'], function() {

  gulp.watch('lib/**/*.js', ['jshint']);

});

gulp.task('default', [''], function() {
  gulp.start('dev');
});
