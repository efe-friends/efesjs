'use strict';

var gulp = require('gulp');

// Load plugins
var $ = require('gulp-load-plugins')();

gulp.task('clean', require('del').bind(null, ['lib']));

/* es6 */
gulp.task('es6', function() {
  return gulp.src(['src/**/*.js','!src/client/template/**/*.js', '!src/libs/**/*.js'])
    .pipe($.plumber())
    .pipe($.babel({
      presets: ['es2015']
    }))
    .on('error', $.util.log)
    .pipe(gulp.dest('lib'));
});

gulp.task('copy', function(){
  return gulp.src(['src/client/template/**/*', 'src/libs/**/*'])
    .pipe(gulp.dest('lib/client/template'));
});

gulp.task('watch', ['es6', 'copy'], function() {

  gulp.watch(['src/**/*.*'], ['es6', 'copy']);

});

gulp.task('build',['es6', 'copy']);

gulp.task('default',['clean'], function() {

  gulp.start('watch');

});
