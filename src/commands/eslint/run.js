"use strict";

(()=> {

  const linter = require('./utils/eslinting');

  module.exports = function(options) {

    console.log('\nEsLinting...');

    return linter(options.file, options.config);

  };

})();