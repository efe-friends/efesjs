"use strict";

(() => {

  const chalk = require('chalk');
  const eslint = require('eslint').linter;
  const fs = require('fs');
  const table = require('text-table');

  class EsLinting {

    constructor() {

    }

    reporter(messages, file) {

      if (!messages.length) {
        return;
      }

      let errorLen = 0;
      let warnLen = 0;

      let output = messages.map(function(message) {
        let out = [];

        message.warn ? warnLen++ : errorLen++;

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
      warnLen && console.log(chalk.yellow.bold('\n\u2716 ' + warnLen + ' lint warning'));
      errorLen && console.log(chalk.red.bold('\n\u2716 ' + errorLen + ' lint problems'));

    }

    linter(file, config) {

      let code = fs.readFileSync(file, {
        encoding: 'utf8'
      });

      let configs = JSON.parse(fs.readFileSync(config, {
        encoding: 'utf8'
      }));

      let messages = eslint.verify(code, configs);
      let errorLen = 0;

      messages = messages.map(function(message) {
        let warn = !message.fatal && message.severity === 1;
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

    }

  }

  var linting = new EsLinting();

  module.exports = function (file, config) {
    linting.linter(file, config);
  };

})();
