"use strict";
(function() {
  const async = require('async');
  const chalk = require('chalk');
  const fs = require('fs');
  const childProcess = require('child_process');

  const fsp = require('../../../utils/fs.js');
  const path = require('../../../utils/path.js');

  module.exports = function(dirname, options) {

    let projects = fsp.readJSONSync(path.join(dirname, 'efesproject.json'));
    let branch = projects.gitDefaultBranch || 'master';
    let rBranch = new RegExp('\\*\\s' + branch + '\\b', 'm');
    let errors = [];

    if (projects && projects.projects.length > 0) {
      async.eachSeries(projects.projects, function(pj, callback) {

        if (pj.git) {

          let repoName = pj.git;
          let repoPath = path.join(dirname, pj.localDir);

          let configRepo = function() {
            childProcess.exec('efes hook', {
              cwd: repoPath
            }, function(err, stdout){

            });
          };

          if (fs.existsSync(repoPath)) {
            childProcess.exec('git branch', {
              cwd: repoPath
            }, function(err, stdout) {

              console.log('\n',chalk.green('更新 '), `${repoName}`);

              if (rBranch.test(stdout)) {

                let _pull = childProcess.exec('git pull', {
                  cwd: repoPath,
                  stdio: 'inherit'
                });

                _pull.on('close',function(){
                  configRepo();
                  callback();
                });

              } else {

                console.log(chalk.yellow('Warnning'), repoName, '不是 ' + branch + ' 分支， 跳过更新。');
                configRepo();
                callback();

              }
            });
          } else {
            console.log('\n',chalk.green('克隆 '), `${repoName}`);

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
            let _clone = childProcess.spawn(`git`, ['clone', repoName, pj.localDir], {
              stdio: 'inherit'
            });

            /*_clone.stdout.on('data', function(data) {
              console.log(data);
            });

            _clone.stderr.on('data', function(data) {
              console.log(chalk.red('ERROR: '), data);
            });*/

            _clone.on('exit', function(code) {

              if (branch !== 'master') {

                console.log(chalk.green('检出 '),`${repoName} 分支：${branch}`);

                childProcess.exec(`git checkout -b ${branch}`, {
                  cwd: repoPath
                }, function(err, stdout, stderr) {
                  if (err) {
                    console.log(chalk.bgRed('Error'), repoName, stderr);
                  }
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
