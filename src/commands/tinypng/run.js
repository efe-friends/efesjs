const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

module.exports = (options)=> {
  console.log('开始压缩图片...');
  let file = options.file || "./*.{png,jpg,jpeg,gif}";
  let dist = options.dist || "./build";
  gulp.src(file)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(dist));
};