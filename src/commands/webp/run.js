const gulp = require('gulp');
const imageminWebp = require('imagemin-webp');

module.exports = (options)=> {
  console.log('开始处理图片...');
  let file = options.file || "./*.{png,jpg,jpeg,gif}";
  let dist = options.dist || "./build";
  gulp.src(file)
    .pipe(imageminWebp({
      quality: 50
    })())
    .pipe(gulp.dest(dist));
};

// export default (options)=> {
//   console.log('开始处理 图片...');
//   let file = options.file;
//   let dist = options.dist || "./";
//   gulp.src(file)
//     .pipe(imageminWebp({
//       quality: 50
//     })())
//     .pipe(gulp.dest(dist));
// }
