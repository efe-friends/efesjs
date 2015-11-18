"use strict";
/*
1、搜索有修改的目录中是否包含 .efesconfig 文件。
2、对 .efesconfig文件当前目录下，和子目录下的文件进行检索
3、找到.html、.htm文件，检索这些文件中引用的js、css的url 是否添加了 ‘?VERSION’ 字符串
 */
(() => {
  const chalk = require('chalk');
  const fs = require('fs');
  const table = require('text-table');
  const jsdom = require('jsdom');
  const path = require('../../../utils/path.js');
  const url = require('url');

  const stReg = /('(\\.|[^\\'])*'|"(\\.|[^\\"])*")/ig;

  const verString = "VERSION";

  const trim = function(str) {
    return str.replace(/^"/, '').replace(/^'/, '').replace(/"$/, '').replace(/'$/, '');
  };

  class CheckVersion {

    _reporter(messages, file) {

      let _this = this;

      if (!messages.length) {
        return;
      }
      let output = messages.map(function(message) {
        let out = [];
        out.push(message.type);
        out.push(message.uri);
        out.push(chalk.yellow('warning'));
        return out;
      });
      output = table(output, {
        align: ['r', 'l']
      });
      output = output.split('\n').map(function(el) {
        return el.replace(/(\d+)\s+(\d+)/, function(m, p1, p2) {
          return chalk.grey(p1 + ':' + p2);
        });
      }).join('\n');
      console.log('\n' + file + '\n');
      console.log(output);
      console.log(chalk.red.bold('\n\u2716 ' + messages.length + ' ill version string'));
    }

    checkVer(file) {
      this.scanHtml(file);
    }

    _isIllVersion(uri) {
      let _url = url.parse(uri);

      if (_url.host === null || _url.host.indexOf('h5.edaijia.cn') !== -1 || _url.host.indexOf('h5.d.edaijia.cn') !== -1) {
        if (_url.query && _url.query.indexOf(verString) !== -1) {
          return false;
        }
        return true;
      }

      return false;
    }

    _domAnalyse(window, res) {

      let _this = this;

      let $ = require('jquery')(window);

      let source = [];

      $("script").each(function() {
        if ($(this).attr('src')) {

          let uri = $(this).attr('src')

          if (_this._isIllVersion(uri)) {

            source.push({
              type: 'js',
              uri: uri
            });

          }
        } else {

          var script = $(this).text();
          var strings = script.match(stReg);

          strings.map(function(str) {

            let _url = url.parse(trim(str));

            if (/\.js$/i.test(_url.pathname)) {
              let uri = trim(str);

              if (_this._isIllVersion(uri)) {

                source.push({
                  type: 'js',
                  uri: uri
                });

              }

            } else if (/\.css$/i.test(_url.pathname)) {

              let uri = trim(str);

              if (_this._isIllVersion(uri)) {

                source.push({
                  type: 'css',
                  uri: uri
                });

              }
            }
          });
        }
      });

      $("[rel=stylesheet]").each(function() {
        let uri = $(this).attr('href');

        if (_this._isIllVersion(uri)) {

          source.push({
            type: 'css',
            uri: uri
          });
        }

      });

      return source;
    }

    scanHtml(file, dirname) {

      let _this = this;

      let errorLen = 0;

      let html = fs.readFileSync(file, {
        encoding: 'utf8'
      });

      jsdom.env(html, function(error, window) {
        let $ = require('jquery')(window);

        let source = _this._domAnalyse(window, file);

        if (source.length > 0) {
          _this._reporter(source, file);
        }
      });
    }


    upVersion(repo, dirname) {

      let file = path.join(dirname, repo);

      let _this = this;

      let html = fs.readFileSync(file, {
        encoding: 'utf8'
      });

      jsdom.env(html, function(error, window) {

        let source = _this._domAnalyse(window, file);

        if (source.length > 0) {

          console.log(chalk.yellow(`更新文件『${repo}』中js、css的 VERSION 字符串...`));

          source.map(function(res) {
            let _uri = url.parse(res.uri)
            _uri.search = `?${verString}`;
            let _url = url.format(_uri);
            console.log(chalk.green(`${res.uri} to ${_url}`));
            html = html.replace(res.uri, url.format(_url));
          });

        }

        fs.writeFileSync(file, html);

        window.close();

      });
    }

  }

  module.exports = new CheckVersion();

})();
