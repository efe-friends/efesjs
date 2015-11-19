"use strict";
/*
 * 针对.html、.htm文件，检索这些文件中引用的js、css的url 是否添加了 ‘?VERSION’ 字符串
 */
(() => {
  const chalk = require('chalk');
  const fs = require('fs');
  const table = require('text-table');
  const jsdom = require('jsdom');
  const path = require('../../../utils/path.js');
  const url = require('url');

  const stReg = /('(\\.|[^\\'])*'|"(\\.|[^\\"])*")/ig;

  const trim = function(str) {
    return str.replace(/^"/, '').replace(/^'/, '').replace(/"$/, '').replace(/'$/, '');
  };

  class VersionString {

    constructor() {
      this.illSource = [];
      this.verString = 'VERSION';
    }

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

    checkVer(repo, dirname, options) {

      if (options && options.string) {
        this.verString = options.string
      }

      this.scanHtml(repo, dirname);
    }

    _isIllVersion(uri) {
      let _url = url.parse(uri);

      if (_url.host === null || _url.host.indexOf('h5.edaijia.cn') !== -1 || _url.host.indexOf('h5.d.edaijia.cn') !== -1) {
        if (_url.search && _url.search == `?${this.verString}`) {
          return false;
        }
        return true;
      }

      return false;
    }

    _pushIllSource(uri, type) {
      let _this = this;

      if (_this._isIllVersion(uri)) {

        _this.illSource.push({
          type: 'js',
          uri: uri
        });

      }

    }

    _domAnalyse(window, res) {

      let _this = this;

      let $ = require('jquery')(window);

      //let source = [];
      _this.illSource = [];

      $("script").each(function() {
        if ($(this).attr('src')) {

          _this._pushIllSource($(this).attr('src'), 'js');

        } else {

          var script = $(this).text();
          var strings = script.match(stReg);

          strings.map(function(str) {

            let _url = url.parse(trim(str));

            if (/\.js$/i.test(_url.pathname)) {

              _this._pushIllSource(trim(str), 'js');

            } else if (/\.css$/i.test(_url.pathname)) {

              _this._pushIllSource(trim(str), 'css');

            }
          });
        }
      });

      $("[rel=stylesheet]").each(function() {

        _this._pushIllSource($(this).attr('href'), 'css');

      });

      return _this.illSource;
    }

    scanHtml(repo, dirname) {

      let _this = this;

      let file = path.join(dirname, repo);

      let errorLen = 0;

      let html = fs.readFileSync(file, {
        encoding: 'utf8'
      });

      jsdom.env(html, function(error, window) {
        let $ = require('jquery')(window);

        _this._domAnalyse(window, file);

        if (_this.illSource.length > 0) {
          _this._reporter(_this.illSource, repo);
        }
      });
    }


    upVersion(repo, dirname, options, callback) {

      let _this = this;

      if (options && options.string) {
        _this.verString = options.string
      }

      let file = path.join(dirname, repo);

      let html = fs.readFileSync(file, {
        encoding: 'utf8'
      });

      jsdom.env(html, function(error, window) {

        _this._domAnalyse(window, file);

        if (_this.illSource.length > 0) {

          console.log(chalk.yellow(`更新文件『${repo}』中js、css的VERSION String...`));

          _this.illSource.map(function(res) {
            let _uri = url.parse(res.uri)
            _uri.search = `?${_this.verString}`;
            let _url = url.format(_uri);
            console.log(chalk.green(`${res.uri} to ${_url}`));
            html = html.replace(res.uri, url.format(_url));
          });

        }

        fs.writeFileSync(file, html);

        window.close();

      });

      callback(null, _this.illSource);
    }

  }

  module.exports = new VersionString();

})();
