"use strict";
(function() {
  global.efesecho.log('正在启动efes本地代理服务...');
  let stream = process.stdout;
  let loadding = ['|', '/', '-', '\\'];
  let _i = 0;
  if (stream && stream.cursorTo) {
    stream.cursorTo(0);
    stream.write(loadding[_i]);
    stream.cursorTo(0);
    _i++;
    _i = _i % loadding.length;
  }
  global.timer = setInterval(function() {
    if (stream && stream.cursorTo) {
      stream.cursorTo(0);
      stream.write(loadding[_i]);
      stream.cursorTo(0);
      _i++;
      _i = _i % loadding.length;
    }
  }, 50);
  
  const fsp = require('../../utils/fs.js');
  const path = require('../../utils/path.js');
  const lServer = require('./utils/lServer.js');
  module.exports = function(options) {

    options.port = options.port || 7070;

    let dirname = process.cwd();

    let spaceInfo = fsp.readJSONSync(path.join(dirname,'efesproject.json'));

    if (!spaceInfo) {
      global.efesecho.log(chalk.red("没有在当前目录找到efes项目配置文件：efesproject.json，请先参考github上efes的说明创建此文件。"));
    } else {
      lServer(options, spaceInfo);
    }

  };

})();
