"use strict";
/*
1、搜索有修改的目录中是否包含 .ehookconfig 文件。
2、对 .ehookconfig文件当前目录下，和子目录下的文件进行检索
3、找到.html、.htm、.jade文件，检索这些文件中引用的js、css的url 是否添加了 ‘?VERSION’ 字符串
 */
(function() {
    //var async = require('async');
    var chalk = require('chalk');
    //var childProcess = require('child_process');
    var fs = require('fs');
    //var fsp = require('../util/fs');
    //var path = require('../util/path.js');
    var table = require('text-table');
    //var glob = require('glob');
    var jsdom = require('jsdom');
    var url = require('url');

    //var rFileStatus = /^[A-Z]\s+(.+)$/;

    var stReg = /('(\\.|[^\\'])*'|"(\\.|[^\\"])*")/ig;

    var trim = function(str) {
        return str.replace(/^"/, '').replace(/^'/, '').replace(/"$/, '').replace(/'$/, '');
    };

    var ckver = {

        reporter: function(messages, file) {
            if (!messages.length) {
                return;
            }
            var output = messages.map(function(message) {
                var out = [];
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
        },

        checkVer: function(file) {
            ckver.scanHtml(file);
        },

        isIllVersion: function(uri) {
            var _url = url.parse(uri);

            if (_url.host === null || _url.host.indexOf('h5.edaijia.cn') !== -1 || _url.host.indexOf('h5.d.edaijia.cn') !== -1) {
                if (_url.query && _url.query.indexOf('VERSION') !== -1) {
                    return false;
                }
                return true;
            }

            return false;
        },

        scanHtml: function(file) {
            var errorLen = 0;

            var html = fs.readFileSync(file, {
                encoding: 'utf8'
            });

            jsdom.env(html, function(error, window) {
                var $ = require('jquery')(window);

                var source = [];

                var errors = [];

                $("script").each(function() {
                    if ($(this).attr('src')) {
                        source.push({
                            type: 'js',
                            uri: $(this).attr('src')
                        });
                    } else {
                        var script = $(this).text();
                        var strings = script.match(stReg);
                        strings.map(function(str){
                            var _url = url.parse(trim(str));
                            if (/\.js$/i.test(_url.pathname)) {
                                source.push({
                                    type: 'js',
                                    uri: trim(str)
                                });
                            } else if (/\.css$/i.test(_url.pathname)) {
                                source.push({
                                    type: 'css',
                                    uri: trim(str)
                                });
                            }
                        });
                    }
                });

                $("[rel=stylesheet]").each(function() {
                    source.push({
                        type: 'css',
                        uri: $(this).attr('href')
                    });
                });

                source.map(function(res) {
                    if (ckver.isIllVersion(res.uri)) {
                        errorLen += 1;
                        errors.push(res);
                    }
                });

                if (errorLen > 0) {
                    ckver.reporter(errors, file);
                }
            });
        }
    };

    module.exports = ckver;

})();
