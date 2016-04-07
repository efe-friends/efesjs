"use strict";
(function() {

  const chalk = require('chalk');
  const http = require('http');
  const mime = require('mime');
  const url = require('url');
  const md5 = require('md5');

  const browserSync = require('browser-sync');

  const work = require('../../../utils/efesWorkspace.js');
  const path = require('../../../utils/path.js');

  /*const $ = require('gulp-load-plugins')();
  const es2015 = require('babel-preset-es2015');
  const react = require('babel-preset-react');
  const through = require('through-gulp');*/

  const rType = /\.(\w+)$/i;

  let onRequest = function(request, response, dirs, spaceInfo, options) {

    let pathname = url.parse(request.url).pathname;
    let host = request.headers.host;

    //console.log(chalk.green('start----'), (new Date()).getTime(), pathname);

    let output = function(code, data) {
      if (data) {
        if (!options.browsersync) {
          response.writeHeader(code, {
            'content-type': pathname.match(rType)?mime.lookup(pathname):mime.lookup('json'),
          });
        }
        response.end(data);

      } else {
        response.writeHeader(code);
        response.end();
      }
    };

    //let localPathname = work.tmpPublishDirForLocalDir[md5(host + '/' + pathname)];

    //if (!localPathname) {
      // 由于需要支持 一个根访问路径 可以配置多个 本地目录，
      // 所以匹配出来的本地路径有可能会有多个。
      // todo 每个查找在第一次大约要使用300ms，有待优化
      let localPathname = work.getLocalPathname(pathname, host, dirs, spaceInfo);

      // 将已经查找到的路径对应关系缓存起来，方便下次调用。
      //work.tmpPublishDirForLocalDir[md5(host + '/' + pathname)] = localPathname;

    //}

    //response.end(JSON.stringify(dirs));
    //return;

    console.log(chalk.bold.green('GET:') + ' http://' + host + pathname);
    work.loadFile(localPathname, options, function(err, filedata, local) {
      //console.log(chalk.grey('Local:' + local));

      if (err) {

        console.error(chalk.bold.white.bgRed(' ERROR '));

        err.some(function(_err) {
          console.error(_err);
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

  let startServer = function(dirs, options, spaceInfo) {

    if (options.browsersync) {
      global.bs = require("browser-sync").create();
      global.bs.init({
        port: options.port,
        server: {
          baseDir: "./"
        },
        open: false,
        middleware: function(request, response, next) {
          onRequest(request, response, dirs, spaceInfo, options);
        }
      });
      return;
    }

    let server = http.createServer();

    server.on('listening', function(err) {
      if (err) {
        console.error(chalk.red('efes本地代理服务启动失败'));
      } else {

        console.log('启动成功，监听端口： %s', options.port);
      }

    });

    server.on('request', function(request, response) {

      onRequest(request, response, dirs, spaceInfo, options);

    });

    server.listen(options.port);
  };

  module.exports = function(options, spaceInfo) {

    // 在程序启动的时候，将本地服务器需要先编译一个es6文件，
    // 预加载一下babel-preset-es2015模块，
    // 防止第一次请求的时候，因为加载这个模块占用的时间导致请求超时。

    //work.loadFile([{
    //  root: __dirname,
    //  output: 'scripts/index.js',
    //  input: ['preload.babel']
    //}], options, function(err, filedata, local) {

      if (!work.tmpLocalEfesProjectDirs) {

        work.loadLocalDir(spaceInfo, function(dirs) {

          work.tmpLocalEfesProjectDirs = dirs;

          startServer(dirs, options, spaceInfo);
        });

      } else {

        startServer(work.tmpLocalEfesProjectDirs, options, spaceInfo);

      }

    //});

  };

})();
