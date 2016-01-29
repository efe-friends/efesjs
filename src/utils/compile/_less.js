(() => {

  const assign = require('object-assign');
  const applySourceMap = require('vinyl-sourcemaps-apply');
  const less = require('less');
  const LessPluginAutoPrefix = require('less-plugin-autoprefix');
  const fs = require('fs');
  const async = require('async');
  const chalk = require('chalk');

  const fsp = require('../fs.js');
  const walk = require('../walk.js');
  const path = require('../path.js');

  module.exports = function(input, dir, options, callback) {

    // Mixes in default options.
    let opts = assign({}, {
      compress: false,
      paths: []
    }, options);

    let str = fsp.readFileSync(path.join(dir, input));
    let file = {};

    opts.filename = input;
    opts.paths = [path.dirname(path.join(dir, input))];
    opts.sourcemap = true;

    let autoprefixPlugin = new LessPluginAutoPrefix({
      browsers: ['> 1%',
        'last 2 versions',
        'Firefox ESR',
        'Opera 12.1'
      ]
    });
    opts.plugins = [autoprefixPlugin];

    less.render(str, opts).then(function(res) {

      return new Buffer(res.css);

    }).then(function(file) {

      callback(null, file);

    }).catch(function(err) {

      err.lineNumber = err.line;
      err.fileName = err.filename;

      // Add a better error message
      err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

      console.log(chalk.bold.white.bgRed(' Less: '));
      console.log(err.message);

      return callback(err);
    });
  };
})();
