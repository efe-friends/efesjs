(function() {

  const assign = require('object-assign');
  const applySourceMap = require('vinyl-sourcemaps-apply');
  const less = require('less');
  const fs = require('fs');
  const async = require('async');
  const chalk = require('chalk');
  const jade = require('jade');

  const fsp = require('../../../../utils/fs.js');
  const walk = require('../../../../utils/walk.js');
  const path = require('../../../../utils/path.js');

  module.exports = function(input, dir, options, callback) {

    try {
      let html = jade.renderFile(path.join(dir, input), options);
      callback(null, html);
    } catch (e) {
      callback(e);
    }

  };

})();
