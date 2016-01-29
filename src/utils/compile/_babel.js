(function() {

  const assign = require('object-assign');
  const applySourceMap = require('vinyl-sourcemaps-apply');
  const fs = require('fs');
  const async = require('async');
  const chalk = require('chalk');
  const babel = require("babel-core");

  const fsp = require('../fs.js');
  const walk = require('../walk.js');
  const path = require('../path.js');

  module.exports = function(input, dir, options, callback) {

    let opts = assign({}, {
      presets: ['es2015']
    }, options);

    opts = {
      presets: ["es2015"]
    };

    console.log('-----',new Date);
    babel.transformFile(path.join(dir, input), opts, function(err, res) {
      console.log('-----',new Date);
      if (res) {
        callback(err, res.code);
        return;
      }
      console.log(chalk.bold.white.bgRed(' Babel: '));
      console.log(err);
      callback(err);

      //result; // => { code, map, ast }
    });

  };

})();
