"use strict";

(()=> {

  const linter = require('./utils/csslinting');

  module.exports = function(options) {

    console.log('\nCssLinting...');

    linter(options.file, options.config);

  };

})();