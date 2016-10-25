"use strict";

(function() {

  const async = require('async');
  const chalk = require('chalk');
  const fs = require('fs');
  const regexfiles = require('regex-files');

  const fsp = require('../../../utils/fs.js');
  // const walk = require('../../../utils/walk.js');
  const path = require('../../../utils/path.js');


  module.exports = function(data, callback) {

    let dirname = path.join(__dirname, '..', 'template', data.scaffold);

    let rIncludes = [];

    let rExcludes = [/\.git/, /\.tmp/, /.DS_Store/, /README.md/];

    if (!data.exCoffee) {
      rExcludes.push(/coffee/);
    }
    if (!data.exES6) {
      rExcludes.push(/es6/);
    }
    if (!data.exLess) {
      rExcludes.push(/less/);
    }
    if (!data.exJade) {
      rExcludes.push(/jade/);
    }
    if (!data.exIcons) {
      rExcludes.push(/icons/);
    }
    if (!data.modCallClient) {
      rExcludes.push(/call-client/);
    }
    if (!data.modDownload) {
      rExcludes.push(/download/);
    }
    if (!data.modLandscape) {
      rExcludes.push(/landscape-tip/);
    }
    if (!data.modScroll) {
      rExcludes.push(/transation/);
      rExcludes.push(/animations/);
    }
    if (!data.modWebp) {
      rExcludes.push(/webp/);
    }
    if (!data.modWeight) {
      rExcludes.push(/weight/);
    }
    if (!data.modShakeHand) {
      rExcludes.push(/shake-hand/);
    }

    regexfiles(dirname, rExcludes, rIncludes, function(err, results) {
      async.each(results, function(repo, done) {
        let stat = fs.lstatSync(repo);
        let rdirname = path.relative(dirname, repo);
        let fall = [];
        if (stat.isDirectory()) {
          fall.push(fsp.pMkdir(rdirname));
        } else if (!/^\./.test(rdirname)) {
          fall.push(fsp.pWriteFile(rdirname.replace('_', '.'), repo, data));
        }
        async.waterfall(fall, done);
      }, function() {
        callback();
      });
    });
  };

})();
