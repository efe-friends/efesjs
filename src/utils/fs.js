"use strict";

(function() {
  const fs = require('fs');
  const mkdirp = require('mkdirp');
  const chalk = require('chalk');
  const getDirName = require('path').dirname;
  const template = require('art-template');
  const path = require('./path');

  exports.findFileSync = function(filename, start, stop) {
    start = path.resolve(start);
    stop = stop && path.resolve(stop) || '';
    var result;
    while (!/^(?:[a-z]:)?$/i.test(start) && start.indexOf(stop) === 0) {
      if (fs.existsSync(result = start + '/' + filename) && fs.statSync(result).isFile()) {
        return result;
      }
      start = start.replace(/\/[^\/]+$/, '');
    }
  };

  exports.writeFileSync = function(filename, filedata) {
    if (!fs.existsSync(path.dirname(filename))) {
      var segments = filename.split('/');
      var segment = segments.shift() + '/' + segments.shift();
      while (segments.length) {
        if (!fs.existsSync(segment)) {
          fs.mkdirSync(segment);
        }
        segment += '/' + segments.shift();
      }
    }
    fs.writeFileSync(filename, filedata);
  };

  exports.readFileSync = function(filename, buffer) {
    return fs.readFileSync(filename, !buffer && {
      encoding: 'utf8'
    });
  };

  exports.readJSONSync = function(filename) {
    let filedata, data;
    try {
      filedata = fs.readFileSync(filename);
      if (filedata) {
        data = JSON.parse(filedata);
      }
    } catch (e) {
      return null;
    }
    return data;
  };

  exports.writeJSONSync = function(filename, filedata) {
    fs.writeFileSync(filename, JSON.stringify(filedata, null, 2));
  };

  exports.readFileCommit = function(filename, commit, callback, buffer) {
    commit.getEntry(filename, function(err, entry) {
      if (err || !entry.isFile()) {
        callback(filename + ' doesn\'t exist');
      } else {
        entry.getBlob(function(err, blob) {
          if (err) {
            callback(err);
          } else {
            callback(null, buffer ? blob.content() : blob.toString());
          }
        });
      }
    });
  };

  exports.pMkdir = function(dir) {
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
  };

  exports.pWriteFile = function(filename, retmpl, data) {
    return function(callback) {

      var tmpl = null;

      var _extname = path.extname(filename);

      if (/^\.(jpg|png|gif|jpeg)$/i.test(_extname)) {
        tmpl = fs.readFileSync(retmpl);
      }
      else {

        template.config('extname', path.extname(filename));

        tmpl = template(retmpl.replace(path.extname(filename), ''), data);

      }

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
  };


})();
