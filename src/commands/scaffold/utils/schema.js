"use strict";
(() => {

  const path = require('../../../utils/path.js');
  const chalk = require('chalk');

  class Schema {
    constructor(initCmd = true) {

      let _this = this;

      this.options = {};

      this.initCmd = initCmd === true;

      this.done = function() {};

      this.prompt = require('prompt');
      this.inquirer = require("inquirer");

      _this.info = {};

      this.project = [{
        'name': 'name',
        'message': '项目名称：',
        'default': _this.info.name || path.basename(process.cwd())
      }, {
        'name': 'description',
        'message': '项目描述：',
        'default': _this.info.description || '',
        'required': true
      }];

      this.projectInfo = [{
        'name': 'id',
        'message': '项目ID：',
        'default': _this.info.id || '',
        'required': true
      }, {
        'name': 'publishUrl',
        'message': '线上环境地址',
        'default': _this.info.publishUrl || ''
      }, {
        'name': 'devUrl',
        'message': '开发环境地址',
        'default': _this.info.devUrl || ''
      }];

      this.scaffold = [{
        'type': 'list',
        'name': 'check',
        'message': '使用脚手架生成文件结构：',
        'choices': [{
          'name': 'NO',
          checked: true
        }, {
          'name': 'YES',
          checked: false
        }],
        'default': true,
        'required': true
      }];

      this.platform = [{
        'type': 'list',
        'name': 'check',
        'message': '发布平台：',
        'choices': [{
          'name': 'mobile-web',
          checked: true
        }, {
          'name': 'pc-web',
          checked: false
        }],
        'default': true,
        'required': true
      }];

      this.exLanguage = [{
        'type': 'checkbox',
        'name': 'check',
        'message': '选择需要支持的扩展功能：',
        'choices': [{
          'name': 'es6',
          checked: true
        }, {
          'name': 'coffee',
          checked: true
        }, {
          'name': 'jade',
          checked: true
        }, {
          'name': 'less',
          checked: true
        }, {
          'name': 'icons精灵图',
          checked: true
        }, {
          'name': 'webp',
          checked: true
        }],
        'default': true,
        'required': true
      }];

      this.mobileMod = [{
        'type': 'checkbox',
        'name': 'check',
        'message': '选择需要支持的功能块：',
        'choices': [{
          'name': '微信',
          checked: true
        }, {
          'name': 'webp图片优化',
          checked: true
        }, {
          'name': '滑屏',
          checked: false
        }, {
          'name': '唤起客户端或跳转到下载',
          checked: false
        }, {
          'name': '客户端内部调用原生功能',
          checked: false
        }, {
          'name': '摇一摇',
          checked: false
        }, {
          'name': '重力感应',
          checked: false
        }, {
          'name': '横屏提示',
          checked: false
        }],
        'default': true,
        'required': true
      }];

      this.end = [{
        'name': 'confirm',
        'message': chalk.green('还需要对上述操作进行修改吗？'),
        'default': 'y/N'
      }];
    }

    _confirmEnd() {

      let _this = this;

      _this.prompt.get(_this.end, function(error, endResult) {

        let continuing = endResult.confirm.toLowerCase() !== 'y';

        if (continuing) {

          console.log('');

          _this.done(_this.info);

        } else {

          _this.start(_this.options);

        }
      });
    }

    _writeExLanguage() {

      let _this = this;

      _this.inquirer.prompt(_this.exLanguage, function(answers2) {

        _this.info.exCoffee = answers2.check.indexOf('coffee') !== -1;
        _this.info.exLess = answers2.check.indexOf('less') !== -1;
        _this.info.exJade = answers2.check.indexOf('jade') !== -1;
        _this.info.exES6 = answers2.check.indexOf('es6') !== -1;
        _this.info.exIcons = answers2.check.indexOf('icons精灵图') !== -1;
        _this.info.exWebp = answers2.check.indexOf('webp') !== -1;

        _this._confirmEnd();

      });
    }

    _writeMobileMod() {

      let _this = this;

      _this.info.scaffold = "h5";

      _this.inquirer.prompt(_this.mobileMod, function(answersMobile) {

        _this.info.modWeixin = answersMobile.check.indexOf('微信') !== -1;

        _this.info.modWebp = answersMobile.check.indexOf('webp图片优化') !== -1;

        _this.info.modScroll = answersMobile.check.indexOf('滑屏') !== -1;

        _this.info.modDownload = answersMobile.check.indexOf('唤起客户端或跳转到下载') !== -1;

        _this.info.modCallClient = answersMobile.check.indexOf('客户端内部调用原生功能') !== -1;

        _this.info.modShakeHand = answersMobile.check.indexOf('摇一摇') !== -1;

        _this.info.modWeight = answersMobile.check.indexOf('重力感应') !== -1;

        _this.info.modLandscape = answersMobile.check.indexOf('横屏提示') !== -1;

        _this._writeExLanguage();

      });
    }

    _writePcMod() {

      let _this = this;

      _this.info.scaffold = "web";

      _this._writeExLanguage();

    }

    _writePlatform() {

      let _this = this;

      _this.inquirer.prompt(_this.platform, function(answers) {

        _this.info.platform = answers.check === "mobile-web" ? "mobile" : "pc";

        if (_this.info.platform === 'mobile') {

          _this._writeMobileMod();

        } else {

          _this._writePcMod();

        }
      });
    }

    _writeScaffold() {

      let _this = this;

      _this.inquirer.prompt(_this.scaffold, function(answers) {

        _this.info.scaffold = answers.check === "NO" ? "none" : "default";

        if (_this.info.scaffold === 'none') {

          _this.info.exCoffee = false;
          _this.info.exLess = false;
          _this.info.exJade = false;
          _this.info.exES6 = false;
          _this.info.exIcons = false;
          _this.info.exWebp = false;

          _this._confirmEnd();

        } else {

          _this._writeExLanguage();

        }
      });

    }

    _writeProjectInfo() {

      let _this = this;

      this.prompt.get(_this.project, function(error, res) {

        _this.info.name = res.name;
        _this.info.description = res.description;

        _this.projectInfo[0].default = _this.projectInfo[0].default || res.name;
        _this.projectInfo[1].default = _this.projectInfo[1].default || 'http://h5.edaijia.cn/' + res.name;
        _this.projectInfo[2].default = _this.projectInfo[2].default || 'http://h5.d.edaijia.cn/' + res.name;

        _this.prompt.get(_this.projectInfo, function(error, result) {

          _this.info.id = result.id;
          _this.info.publishUrl = result.publishUrl;
          _this.info.devUrl = result.devUrl;

          if (_this.initCmd) {

            _this._writeScaffold();

          } else {

            _this._writePlatform();

          }

        });
      });

    }

    start(options, done) {

      let _this = this;

      _this.options = options;

      _this.done = done;

      this.prompt.message = chalk.green('[?]');
      this.prompt.delimiter = ' ';
      this.prompt.start();

      this._writeProjectInfo();

    }

  }

  module.exports = Schema;

})();
