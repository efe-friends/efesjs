"use strict";
(function() {

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

  const main = require('./core/load.js');

  //main.cli();

})();
