"use strict";

(()=> {

  const linter = require('./utils/eslinting');
  const path = require('../../utils/path');

  module.exports = function(options) {

    console.log('\nEsLinting...');

    linter(options.file, options.config);

  };

})();