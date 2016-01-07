'use strict';

var gulp = require('gulp'),
  browserSync = require('browser-sync'),
  pngquant = require('imagemin-pngquant'),
  imageminWebp = require('imagemin-webp'),
  buffer = require('vinyl-buffer'),
  spritesmith = require('gulp.spritesmith'),
  merge = require('merge-stream'),
  fs = require('fs');

var concatfile = JSON.parse(fs.readFileSync('./concatfile.json'));
var efes = JSON.parse(fs.readFileSync('./.efesconfig'));

// Load plugins
var $ = require('gulp-load-plugins')();
var ccDeps = [];
var jsCcDeps = [];
var imgDeps = [];

/* imagemin */
gulp.task('imagemin', function() {
  var srcs = ['src/images/**/*'];
  if (concatfile.imgMinIgnore&&concatfile.imgMinIgnore.length > 0) { //获取不需要压缩的图片列表，从压缩目录中排除。
    for (var i = 0; i < concatfile.imgMinIgnore.length; i++) {
      srcs.push("!" + concatfile.imgMinIgnore[i]);
    }

    //将不需要压缩的图片copy到images目录
    gulp.src(concatfile.imgMinIgnore)
      .pipe(gulp.dest('images'))
      .pipe(browserSync.reload({
        stream: true
      }));
  }

  return gulp.src(srcs)
    .pipe($.imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('images'))
    .pipe(browserSync.reload({
      stream: true
    }));
});
ccDeps.push('imagemin');
imgDeps.push('imagemin');

{{if exWebp}}
/* webp */
gulp.task('webp', function() {
  var srcs = ['src/images/**/*'];

  return gulp.src(srcs)
    .pipe($.plumber())
    .pipe(imageminWebp({
      quality: 50
    })())
    .pipe(gulp.dest('webps'))
    .pipe(browserSync.reload({
      stream: true
    }));
});
ccDeps.push('webp');
imgDeps.push('webp');
{{/if}}

{{if exIcons}}
/* spritesmith */
gulp.task('spritesmith', function() {
  var srcs = ['src/icons/**/*'];

  // Generate our spritesheet
  var spriteData = gulp.src(srcs).pipe(spritesmith({
    imgName: 'icons.png',
    cssName: 'icons.css'
  }));

  // Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
    .pipe($.plumber())
    .pipe(buffer())
    .pipe($.imagemin())
    .pipe(gulp.dest('images'));

  // Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
    .pipe($.plumber())
    .pipe($.csso())
    .pipe(gulp.dest('styles'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);

});
ccDeps.push('spritesmith');
{{/if}}


/*html*/
gulp.task('html', function() {
  return gulp.src('src/html/**/*.html')
    .pipe(gulp.dest('.'))
    .pipe(browserSync.reload({
      stream: true
    }));
});
ccDeps.push('html');


{{if exLess}}
/* less */
gulp.task('less', function() {
  var browsers = [
    '> 1%',
    'last 2 versions',
    'Firefox ESR',
    'Opera 12.1'
  ];
  return gulp.src('./src/less/publishs/**/*.less')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.less())
    .on('error', $.util.log)
    .pipe($.postcss([
      require('autoprefixer-core')({
        browsers: browsers
      })
    ]))
    .pipe($.sourcemaps.write({includeContent: false, sourceRoot: '/less/publishs'}))
    .pipe(gulp.dest('.tmp/less'))
    .pipe(browserSync.reload({
      stream: true
    }));
});
ccDeps.push('less');

/* css-concat */
gulp.task('css-concat', ['less'], function() {

  var merges = [];

  Object.keys(concatfile.pkg).forEach(function(item) {

    if (/\.css$/i.test(item)) {
      var srcs = concatfile.pkg[item];
      var osrcs = srcs.map(function(ele) {

        if (/\.less$/i.test(ele)) {
          return ele.replace(/\.less$/i, '.css').replace(/^src\/less\/publishs/i, '.tmp/less');
        }

        return ele;
      });

      var publish = item;
      var conc = gulp.src(osrcs)
        .pipe($.sourcemaps.init({
          loadMaps: true
        }))
        .pipe($.concat(publish))
        .pipe($.sourcemaps.write({
          includeContent: false,
          sourceRoot: '/src'
        }))
        .pipe(gulp.dest('.'))
        .pipe(browserSync.reload({
          stream: true
        }));

      merges.push(conc);
    }


  });

  return merge.apply(this, merges);

});

{{/if}}


{{if exCoffee}}
/* coffee */
gulp.task('coffee', function() {

  return gulp.src('./src/coffee/**/*.coffee')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.coffee({
      bare: true
    })).on('error', $.util.log)
    .pipe($.sourcemaps.write({includeContent: false, sourceRoot: '/coffee'}))
    .pipe(gulp.dest('.tmp/coffee'))
    .pipe(browserSync.reload({
      stream: true
    }));

});
ccDeps.push('coffee');
jsCcDeps.push('coffee');
{{/if}}

{{if exES6}}
/* es6 */
gulp.task('es6', function() {
  return gulp.src('src/es6/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe($.sourcemaps.write({includeContent: false, sourceRoot: '/es6'}))
    .pipe(gulp.dest('.tmp/es6'))
    .pipe(browserSync.reload({
      stream: true
    }));
});
ccDeps.push('es6');
jsCcDeps.push('es6');
{{/if}}



{{if exCoffee||exES6}}
/* js-concat */
gulp.task('js-concat', jsCcDeps, function() {

  var merges = [];

  Object.keys(concatfile.pkg).forEach(function(item) {

    if (/\.js$/i.test(item)) {
      var srcs = concatfile.pkg[item];
      var osrcs = srcs.map(function(ele) {

        if (/\.coffee$/i.test(ele)) {
          return ele.replace(/\.coffee$/i, '.js').replace(/^src/i, '.tmp');
        }

        if (/^src\/es6/i.test(ele)) {
          return ele.replace(/^src/i, '.tmp');
        }

        return ele;
      });

      var publish = item;
      var conc = gulp.src(osrcs)
        .pipe($.sourcemaps.init({
          loadMaps: true
        }))
        .pipe($.concat(publish))
        .pipe($.sourcemaps.write({
          includeContent: false,
          sourceRoot: '/src'
        }))
        .pipe(gulp.dest('.'))
        .pipe(browserSync.reload({
          stream: true
        }));

      merges.push(conc);
    }

  });

  return merge.apply(this, merges);

});

{{/if}}


{{if exJade}}
/* jade */
gulp.task('jade', function() {
  return gulp.src('src/jade/publishs/**/*.jade')
    .pipe($.plumber())
    .pipe($.jade({
      pretty: true
    }))
    .on('error', $.util.log)
    .pipe(gulp.dest('.'))
    .pipe(browserSync.reload({
      stream: true
    }));
});
ccDeps.push('jade');
{{/if}}

/* concat */
gulp.task('concat', ccDeps, function() {

  var merges = [];

  Object.keys(concatfile.pkg).forEach(function(item) {
    var srcs = concatfile.pkg[item];
    var osrcs = srcs.map(function(ele) {

      if (/\.coffee$/i.test(ele)) {
        return ele.replace(/\.coffee$/i, '.js').replace(/^src/i, '.tmp');
      }

      if (/^src\/es6/i.test(ele)) {
        return ele.replace(/^src/i, '.tmp');
      }

      if (/\.less$/i.test(ele)) {
        return ele.replace(/\.less$/i, '.css').replace(/^src\/less\/publishs/i, '.tmp/less');
      }

      return ele;
    });

    var publish = item;
    var conc = gulp.src(osrcs)
      .pipe($.sourcemaps.init({
        loadMaps: true
      }))
      .pipe($.concat(publish))
      .pipe($.sourcemaps.write({includeContent: false, sourceRoot: '/src'}))
      .pipe(gulp.dest('.'))
      .pipe(browserSync.reload({
        stream: true
      }));

    merges.push(conc);
  });

  return merge.apply(this, merges);

});


/*gulp.task('copy', function() {
  return gulp.src('')
    .pipe(gulp.dest(''));
});*/


gulp.task('browser-sync', function() {

  if (efes.dev_url.trim()) {
    /*return browserSync({
      proxy: efes.dev_url
    });*/
    return browserSync({
      open: 'external',
      proxy: efes.dev_url
    });
  }

  return browserSync({
    open: 'external',
    server: {
      baseDir: '.'
    }
  });

});


gulp.task('reload-concatfile',function(){

  concatfile = JSON.parse(fs.readFileSync('./concatfile.json'));

});


gulp.task('watch', ['concat'], function() {

  {{if exLess}}
  gulp.watch(['src/less/**/*.*'], ['css-concat']);
  {{/if}}

  gulp.watch(['src/css/**/*.*'], ['css-concat']);

  {{if exCoffee}}
  gulp.watch(['src/coffee/**/*.*'], ['js-concat']);
  {{/if}}

  {{if exES6}}
  gulp.watch(['src/es6/**/*.*'], ['js-concat']);
  {{/if}}

  gulp.watch(['src/js/**/*.*'], ['js-concat']);

  {{if exJade}}
  gulp.watch(['src/jade/**/*.*'], ['jade']);
  {{/if}}

  gulp.watch(['src/images/**/*.*'], imgDeps);

  {{if exSprite}}
  gulp.watch(['src/icons/**/*.*'], ['spritesmith']);
  {{/if}}

  gulp.watch(['src/html/**/*.*'], ['html']);

  gulp.watch('concatfile.json', ['reload-concatfile','concat']);

  gulp.start('browser-sync');
});


gulp.task('default', function() {
  gulp.start('watch');
});
