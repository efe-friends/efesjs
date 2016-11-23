const path = require('path');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const csso = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const spritesmith = require('gulp.spritesmith');
const buffer = require('vinyl-buffer');

module.exports = (options)=> {
  console.log("开始拼接图片...");
  let files = options.files || './*.{png,jpg,jpeg,gif}';
  let dist = options.dist || './build';
  let algorithm = options.algorithm || 'binary-tree';

  let args = {
    imgName: 'icons.png',
    cssName: 'icons.css',
    algorithm: algorithm
  };

  if(options.rem) {
    args.cssTemplate = path.join(__dirname, 'sprite.handlebars');
    args.cssHandlebarsHelpers = {
      percent: function(offset, length, total) {
        let p = (length - total) !== 0 ? offset / (length - total) * 100 : 0; 
        return p;
      },
      px2rem: function(length) {
        return length / 100;
      }
    };
  }

  let spriteData = gulp.src(files).pipe(spritesmith(args));

  var imgStream = spriteData.img
    .pipe(plumber())
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(dist + '/images'));

  var cssStream = spriteData.css
    .pipe(plumber())
    .pipe(csso())
    .pipe(gulp.dest(dist + '/styles'));
  
}

  
