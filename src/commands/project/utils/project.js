"use strict";
(function() {
  const async = require('async');
  const chalk = require('chalk');
  const fs = require('fs');
  const childProcess = require('child_process');
  const assign = require("deep-assign");

  const fsp = require('../../../utils/fs.js');
  const path = require('../../../utils/path.js');

  module.exports = function(dirname, options) {

    let spaceInfo = fsp.readJSONSync(path.join(dirname, 'efesproject.json'));

    let _spaceInfo = assign({
      "global": {
        "git": {
          "branch": {
            "local": "master",
            "remote": ""
          }
        }
      }
    }, spaceInfo);

    let _global = _spaceInfo.global;

    let localBranch = _global.git.branch.local;
    let remoteBranch = _global.git.branch.remote;
    let rBranch = new RegExp('\\*\\s' + localBranch + '\\b', 'm');
    let errors = [];

    let projects = _spaceInfo.projects;

    if (projects && projects.length > 0) {

      async.eachSeries(projects, function(pj, callback) {

        if (pj.git) {

          let repoName = (pj.git.host || _global.git.host) + pj.git.repo + ".git";
          let repoPath = path.join(dirname, pj.git.mapping || pj.git.repo);

          let configRepo = function() {

            let _gitConfig = assign(_global.git.config, pj.git.config);

            if (_gitConfig) {
              for (let i in _gitConfig) {
                childProcess.execSync(`git config ${i} "${_gitConfig[i]}"`, {
                  cwd: repoPath
                });
              }
            }

            childProcess.exec('efes hook', {
              cwd: repoPath
            }, function(err, stdout) {

            });
          };

          if (fs.existsSync(repoPath)) {
            childProcess.exec('git branch', {
              cwd: repoPath
            }, function(err, stdout) {
              console.log('\n');
              console.log(chalk.green('更新 '), `${repoName}`);

              if (rBranch.test(stdout)) {

                let _pull = childProcess.exec('git pull', {
                  cwd: repoPath,
                  stdio: 'inherit'
                });

                _pull.on('close', function() {
                  configRepo();
                  callback();
                });

              } else {

                console.log(chalk.yellow('Warnning'), repoName, '不是 ' + localBranch + ' 分支， 跳过更新。');
                configRepo();
                callback();

              }
            });
          } else {
            console.log('\n');
            console.log(chalk.green('克隆 '), `${repoName}`);

            /*let _clone = childProcess.exec(`git clone ${repoName} ${pj.localDir}`, function(err, stdout, stderr) {

              if (err) {

                console.log(chalk.bgRed('Error'), repoName, stderr);
                callback();

              } else if (branch !== 'master') {

                console.log(`检出 ${repoName} ${branch}`);
                childProcess.exec(`git checkout -b ${branch}`, {
                  cwd: repoPath
                }, function(err, stdout, stderr) {
                  if (err) {
                    console.log(chalk.bgRed('Error'), repoName, stderr);
                  }
                  callback();
                });

              } else {
                callback();
              }
              configRepo();
            });*/
            let _clone = childProcess.spawn(`git`, ['clone', repoName, pj.git.mapping || pj.git.repo], {
              stdio: 'inherit'
            });

            /*_clone.stdout.on('data', function(data) {
              console.log(data);
            });

            _clone.stderr.on('data', function(data) {
              console.log(chalk.red('ERROR: '), data);
            });*/

            _clone.on('exit', function(code) {

              console.log('---',code);

              configRepo();

              if (localBranch !== 'master') {

                console.log(chalk.green('检出 '), `${repoName} 分支：${localBranch} ${remoteBranch}`);

                let _checkout = childProcess.exec(`git checkout -b ${localBranch} ${remoteBranch}`, {
                  cwd: repoPath,
                  stdio: 'inherit'
                });

                _checkout.on('exit', function(code) {
                  callback();
                });
              }
            });
          }
        } else {
          callback();
        }
      }, function() {

      });
    }


  };

})();
