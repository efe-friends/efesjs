"use strict";

(() => {

  const async = require('async');
  const fs = require('fs');
  const chalk = require('chalk');
  const mkdirp = require('mkdirp');
  const getDirName = require('path').dirname;
  const template = require('art-template');

  const path = require('../../../utils/path.js');
  const walk = require('../../../utils/walk.js');


  const scaffoldUtil = {

    mkdir: function(dir) {
      return function(callback) {
        dir = dir.replace(/^\//, ''); //windows下要删掉开头的 / 。
        if (!fs.existsSync(dir)) {
          fs.mkdir(dir, function(err) {
            if (err) {
              console.log('Make ' + dir + '/ ... ' + chalk.red(err.message));
            } else {
              console.log('Make ' + dir + '/ ... ' + chalk.green('OK'));
            }
            callback(err);
          });
        } else {
          console.log('Make ' + dir + '/ ... ' + chalk.green('OK'));
          callback();
        }
      };
    },

    writefile: function(filename, retmpl, projectInfo) {
      return function(callback) {

        template.config('extname', path.extname(filename));
        var tmpl = template(retmpl.replace(path.extname(filename), ''), projectInfo);

        var dir = getDirName(filename);
        dir = dir.replace(/^\//, ''); //windows下要删掉开头的 / 。
        filename = filename.replace(/^\//, ''); //windows下要删掉开头的 / 。

        if (dir) {
          mkdirp(dir, function(err) {
            if (err) {
              console.log('Write ' + filename + ' ... ' + chalk.red(err.message));
              return;
            }

            fs.writeFile(filename, tmpl, function(err) {
              if (err) {
                console.log('Write ' + filename + ' ... ' + chalk.red(err.message));
              } else {
                console.log('Write ' + filename + ' ... ' + chalk.green('OK'));
              }
              callback(err);
            });
          });
          return;
        }

        fs.writeFile(filename, tmpl, function(err) {
          if (err) {
            console.log('Write ' + filename + ' ... ' + chalk.red(err.message));
          } else {
            console.log('Write ' + filename + ' ... ' + chalk.green('OK'));
          }
          callback(err);
        });
      };
    },

    scaffolding: function(data, callback) {

      let dirname = path.join(__dirname, '..', '..', 'template', 'scaffold', data.scaffold);

      let regIncludes = [];

      let regExcludes = [/node_modules/, /\.git/, /\.tmp/, /.DS_Store/];

      if (!data.exCoffee) {
        regExcludes.push(/coffee/);
      }
      if (!data.exES6) {
        regExcludes.push(/es6/);
      }
      if (!data.exLess) {
        regExcludes.push(/less/);
      }
      if (!data.exJade) {
        regExcludes.push(/jade/);
      }

      walk(dirname, regIncludes, regExcludes, function(err, results) {

        async.each(results, function(repo, done) {

          let stat = fs.lstatSync(repo);
          let rdirname = repo.replace(dirname, '').replace(path.sep, '');
          let fall = [];

          if (stat.isDirectory()) {

            fall.push(scaffoldUtil.mkdir(rdirname));

          } else if (!/^\./.test(rdirname)) {

            fall.push(scaffoldUtil.writefile(rdirname.replace('_', '.'), repo, data));

          }
          async.waterfall(fall, done);
        }, function() {
          callback();
        });
      });
    }
  }

  module.exports = scaffoldUtil;

})();
