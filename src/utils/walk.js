"use strict";

(function() {

  const fs = require('fs');
  const path = require('path');

  var regExclude = function(dir, regExcludes, done) {
    var results = [];

    fs.readdir(dir, function(err, list) {
      if (err) return done(err);

      var pending = list.length;
      if (!pending) return done(null, results);

      list.forEach(function(file) {
        file = path.join(dir, file);

        var excluded = false;

        var len = regExcludes.length;
        var i = 0;

        for (; i < len; i++) {

          if (file.match(regExcludes[i])) {
            excluded = true;
          }

        }

        // Add if not in regExcludes
        if (excluded === false) {
          results.push(file);

          // Check if its a folder
          fs.stat(file, function(err, stat) {
            if (stat && stat.isDirectory()) {

              // If it is, walk again
              regExclude(file, regExcludes, function(err, res) {
                results = results.concat(res);

                if (!--pending) {
                  done(null, results);
                }

              });
            } else {
              if (!--pending) {
                done(null, results);
              }
            }
          });
        } else {
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  };

  var walk = function(dir, regIncludes, regExcludes, done) {

    regExclude(dir, regExcludes, function(err, files) {

      var results = [];

      if (regIncludes && regIncludes.length > 0) {

        files && files.some(function(file) {
          var len = regIncludes.length;
          var i = 0;

          for (; i < len; i++) {
            if (file.match(regIncludes[i])) {
              results.push(path.relative(dir, file));
            }
          }

        });

        done(null, results);

      } else {

        done(null, files);

      }

    });

  };

  module.exports = walk;
})();

// var _regIncludes = [/\.efesconfig$/i];
// var _regExcludes = [/\/node_modules\//, /\/\.git\//, /\/\.tmp\//];

// // var _regIncludes = ['**/.efesconfig'];
// // var _regExcludes = ['**/node_modules/**', '**/.git/**', '**/.tmp/**'];

// var st = new Date();
// walk('./', _regIncludes, _regExcludes, function (err, subfiles) {
//   if (err) {
//     console.log(chalk.red(err.message));
//     return;
//   }
//   console.log(subfiles);
//   var end = st.getTime() - (new Date()).getTime()
//   console.log(end)
// });
