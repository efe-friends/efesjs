"use strict";
(function() {
  const chalk = require('chalk');
  const http = require('http');
  const mime = require('mime');
  const url = require('url');
  const assign = require('deep-assign');

  const browserSync = require('browser-sync');

  const epc = require('../../../utils/efesProjectConfigs.js');
  const reqMatchToLocalPath = require('../../../utils/reqMatchToLocalPath.js');
  const buildResBody = require('../../../utils/buildResBody.js');

  const path = require('../../../utils/path.js');
  const fsp = require('../../../utils/fs.js');

  const rType = /\.(\w+)$/i;

  let onRequest = function(request, response, spaceProjectConfigs, spaceInfo, spaceDirname, options) {

    let pathname = url.parse(request.url).pathname;

    if (pathname.match(/\/$/)) {
      pathname = pathname + 'index.html';
    }

    let host = request.headers.host;

    //console.log(chalk.green('start----'), (new Date()).getTime(), pathname);

    let output = function(code, data) {
      if (data) {
        if (!options.browsersync) {
          response.writeHeader(code, {
            'content-type': pathname.match(rType) ? mime.lookup(pathname) : mime.lookup('json'),
          });
        }
        response.end(data);

      } else {
        response.writeHeader(code);
        response.end();
      }
    };

    let projectConfigs = epc.getProjectConfig(host, pathname, spaceInfo, spaceDirname, spaceProjectConfigs);
    // console.log(host, pathname, projectConfigs);
    let pathConfigs = reqMatchToLocalPath.match(host, pathname, projectConfigs, spaceDirname);
    // console.log(host, pathname, spaceProjectConfigs);
    // response.end(JSON.stringify(spaceProjectConfigs));
    // return;

    global.efesecho.log(chalk.bold.green('GET:') + ' http://' + host + pathname);
    buildResBody.build(pathConfigs, options, function(err, filedata, local) {
      //console.log(chalk.grey('Local:' + local));
      
      if (err) {

        global.efesecho.error(chalk.bold.white.bgRed(' ERROR '));

        err.some(function(_err) {
          global.efesecho.error(_err);
        });

        if (filedata) {
          output(502);
        } else {
          output(404);
        }

      } else {
        output(200, filedata);
      }
    });

  };

  let startServer = function(spaceProjectConfigs, spaceInfo, spaceDirname, options) {

    if (options.browsersync) {
      global.bs = require("browser-sync").create();
      global.bs.init({
        port: options.port,
        server: {
          baseDir: "./"
        },
        open: false,
        middleware: function(request, response, next) {
          onRequest(request, response, spaceProjectConfigs, spaceInfo, spaceDirname, options);
        }
      });
      return;
    }

    let server = http.createServer();

    server.on('listening', function(err) {
      if (err) {
        global.efesecho.error(chalk.red('efes本地代理服务启动失败'));
      } else {
        global.efesecho.log('启动成功，监听端口： %s', options.port);
      }
    });

    server.on('request', function(request, response) {
      onRequest(request, response, spaceProjectConfigs, spaceInfo, spaceDirname, options);
    });

    server.listen(options.port);
  };

  module.exports = function(spaceInfo, spaceDirname, options) {

    epc.find(spaceInfo, spaceDirname, function(spaceProjectConfigs){
      // console.log(spaceProjectConfigs);
      startServer(spaceProjectConfigs, spaceInfo, spaceDirname, options);
    });


    // 在程序启动的时候，将本地服务器需要先编译一个es6文件，
    // 预加载一下babel-preset-es2015模块，
    // 防止第一次请求的时候，因为加载这个模块占用的时间导致请求超时。

    //work.loadFile([{
    //  root: __dirname,
    //  output: 'scripts/index.js',
    //  input: ['preload.babel']
    //}], options, function(err, filedata, local) {

    // if (!epc.tmpspaceProjectConfigs || epc.tmpspaceProjectConfigs.length < 1) {

    //   epc.find(spaceInfo, function(configs){
    //     epc.tmpspaceProjectConfigs = configs;
    //     startServer(configs, options, spaceInfo);
    //   });
    //   // work.loadLocalDir(spaceInfo, function(dirs) {

    //   //   work.tmpLocalEfesProjectDirs = dirs;

    //   //   startServer(dirs, options, spaceInfo);
    //   // });

    // } else {
    //   console.log('-----');
    //   startServer(epc.tmpspaceProjectConfigs, options, spaceInfo);

    // }

    //});

  };

})();
