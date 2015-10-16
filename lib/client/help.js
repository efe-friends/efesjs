'use strict';
(function() {

    //var async = require('async');
    var chalk = require('chalk');
    var fs = require('fs');
    //var fsp = require('../util/fs');
    var path = require('../util/path.js');
    //var prompt = require('prompt');
    //var inquirer = require("inquirer");
    //var glob = require('glob');

    var help = function(args) {
        console.log(
            [ "\nUsage: efes <command>"
              , ""
              , "where <command> is one of:"
              , ""
              , "efes hook     为git/svn添加commit提交检查语法功能。"
              , "efes init     初始化项目commit检查项配置。"
              //, "efes lint          commonly asked questions"
              //, "efes@" + efes.version + " " + path.dirname(__dirname)
              ].join("\n"));
        return;
    };

    exports.help = function(options) {
        help(options.base);
    };

})();
