"use strict";
(function() {
    var chalk = require('chalk');
    var csslint = require('csslint').CSSLint;
    var eslint = require('eslint').linter;
    var fs = require('fs');
    var table = require('text-table');

    module.exports = {
        reporter: function(messages, file) {
            if (!messages.length) {
                return;
            }
            var output = messages.map(function(message) {
                var out = [];
                out.push(message.line);
                out.push(message.col);
                out.push(message.warn ? chalk.yellow('warning') : chalk.red('error'));
                out.push(message.message.slice(0, -1));
                out.push(chalk.grey(message.rule.id));
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
            console.log(chalk.red.bold('\n\u2716 ' + messages.length + ' lint problems'));
        },
        eslint: function(file, config) {
            var code = fs.readFileSync(file, {
                encoding: 'utf8'
            });
            var configs = JSON.parse(fs.readFileSync(config, {
                encoding: 'utf8'
            }));
            var messages = eslint.verify(code, configs);
            var errorLen = 0;
            messages = messages.map(function(message) {
                var warn = !message.fatal && message.severity === 1;
                if (!warn) {
                    errorLen += 1;
                }
                return {
                    line: message.line || 0,
                    col: message.column || 0,
                    message: message.message.replace(/\.$/, ''),
                    rule: {
                        id: message.ruleId
                    },
                    warn: warn
                };
            });
            this.reporter(messages, file);
            return errorLen;
        },
        csslint: function(file, config) {
            var code = fs.readFileSync(file, {
                encoding: 'utf8'
            });
            var configs = JSON.parse(fs.readFileSync(config, {
                encoding: 'utf8'
            }));
            var messages = csslint.verify(code, configs).messages;
            var errorLen = 0;
            messages = messages.map(function(message) {
                var warn = message.type === "warning";
                if (!warn) {
                    errorLen += 1;
                }
                return {
                    line: message.line || 0,
                    col: message.col || 0,
                    message: message.message.replace(/\.$/, ''),
                    rule: {
                        id: message.rule.id
                    },
                    warn: warn
                };
            });
            this.reporter(messages, file);
            return errorLen;
        }
    };

})();
