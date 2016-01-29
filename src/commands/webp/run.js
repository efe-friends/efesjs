"use strict";

(function() {

  const Imagemin = require('imagemin');
  const imageminWebp = require('imagemin-webp');

  module.exports = (options) => {

    let file = options.file;

    console.log('开始处理 图片...');

    new Imagemin()
      .src(file)
      .dest('build')
      .use(imageminWebp({
        quality: 50
      }))
      .run();


  };

})();
