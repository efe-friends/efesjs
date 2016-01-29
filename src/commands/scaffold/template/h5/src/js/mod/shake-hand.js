'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 摇一摇功能模块
 * 调用方式：
 * // 绑定摇一摇
 * shakeHand.on(function(){
 *   // do some thing...
 * });
 *
 * // 取消摇一摇
 * shakeHand.off();
 */
(function (window) {

  var deviceMotionHandler = function deviceMotionHandler() {};

  var ShakeHand = function () {
    function ShakeHand() {
      _classCallCheck(this, ShakeHand);

      if (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
        this.SHAKE_THRESHOLD = 5000;
      } else {
        this.SHAKE_THRESHOLD = 3000;
      }
      this.lastUpdate = 0;
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.lastX = 0;
      this.lastY = 0;
      this.lastZ = 0;

      this.callback = function () {};
    }

    _createClass(ShakeHand, [{
      key: '_deviceMotionHandler',
      value: function _deviceMotionHandler(eventData) {

        var _this = this;

        var acceleration = eventData.accelerationIncludingGravity;

        var curTime = new Date().getTime();

        if (curTime - _this.lastUpdate > 10) {

          var diffTime = curTime - _this.lastUpdate;
          _this.lastUpdate = curTime;

          _this.x = acceleration.x;
          _this.y = acceleration.y;
          _this.z = acceleration.z;

          var speed = Math.abs(_this.x + _this.y + _this.z - _this.lastX - _this.lastY - _this.lastZ) / diffTime * 10000;
          if (speed > _this.SHAKE_THRESHOLD) {
            _this.callback();
          }
          _this.lastX = _this.x;
          _this.lastY = _this.y;
          _this.lastZ = _this.z;
        }
      }
    }, {
      key: 'on',
      value: function on(callback) {
        var _this = this;

        if (window.DeviceMotionEvent && typeof callback === 'function') {
          _this.callback = function () {
            callback();
          };
          deviceMotionHandler = function deviceMotionHandler(event) {
            _this._deviceMotionHandler(event);
          };
          window.addEventListener('devicemotion', deviceMotionHandler, false);
        } else {
          alert('not support mobile event');
        }
      }
    }, {
      key: 'off',
      value: function off() {
        window.removeEventListener('devicemotion', deviceMotionHandler);
      }
    }]);

    return ShakeHand;
  }();

  window.shakeHand = new ShakeHand();
})(window);