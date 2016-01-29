"use strict";

(function() {

  const linter = require('./utils/csslinting');

  module.exports = function(options) {

    console.log('\nCssLinting...');

    return linter(options.file, options.config);

  };

})();