const Imagemin = require('imagemin');

new Imagemin()
    .src('images/*.{gif,jpg,png,svg}')
    .dest('build/images')
    .use(Imagemin.jpegtran({progressive: true}))
    .run((err, files) => {
        console.log(files[0]);
        //=> {path: 'build/images/foo.jpg', contents: <Buffer 89 50 4e ...>}
    });