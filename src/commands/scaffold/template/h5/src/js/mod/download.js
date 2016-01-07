/**
 * Download mod
 * 采用 class 的形式，是为了方便可以创建多个实例，为多个不同的按钮绑定下载功能。
 * 调用方式1：
 * var dlm = new DownloadMod('.J-download', {
 *   callIOS: '', // 唤起iOS客户端，字符串，默认值：'edaijia:open'
 *   callAndroid: '', // 唤起Android客户端，字符串，默认值：'https://appsto.re/cn/2rI7B.i'
 *   downIOS: '', // iOS客户端下载地址，字符串，默认值：'app://edaijia/client'
 *   downAndroid: '', // Android客户端下载地址，字符串，必填项。
 *   downWinPhone: '', // WinPhone客户端下载地址，字符串，默认值：'http://www.windowsphone.com/zh-cn/store/app/e代驾/ee8abf90-f100-4cf3-91c5-29af904f0204'
 *   downWeixin: '', // 微信下载提示，function类型，非必填项，无默认值。
 *   downOther: '' // 其他判断不出来的客户端下载地址，字符串，默认值：'http://wap.edaijia.cn'
 * });
 * dlm.init(); // 为按钮绑定 下载 点击事件
 * 
 *
 * 调用方式2：btn使用默认值 .J-download
 * var dlm = new DownloadMod({
 *   callIOS: '', // 唤起iOS客户端，字符串，默认值：'edaijia:open'
 *   callAndroid: '', // 唤起Android客户端，字符串，默认值：'https://appsto.re/cn/2rI7B.i'
 *   downIOS: '', // iOS客户端下载地址，字符串，默认值：'app://edaijia/client'
 *   downAndroid: '', // Android客户端下载地址，字符串，必填项。
 *   downWinPhone: '', // WinPhone客户端下载地址，字符串，默认值：'http://www.windowsphone.com/zh-cn/store/app/e代驾/ee8abf90-f100-4cf3-91c5-29af904f0204'
 *   downWeixin: '', // 微信下载提示，function类型，非必填项，无默认值。
 *   downOther: '' // 其他判断不出来的客户端下载地址，字符串，默认值：'http://wap.edaijia.cn'
 * });
 * dlm.init(); // 为按钮绑定 下载 点击事件
 * 
 * dlm.off(); // 解除按钮的 下载 点击事件
 */

(function(window, $) {

  var _onClick = $.noop;

  var Download = function(btn, option) {

    var _option = option;

    if ($.isPlainObject(btn)) {

      this.btn = ".J-download";
      _option = btn;

    } else {

      this.btn = btn || ".J-download";

    }

    this.callIOS = _option.callIOS || 'edaijia:open';
    this.downIOS = _option.downIOS || 'https://appsto.re/cn/2rI7B.i';
    this.callAndroid = _option.callAndroid || 'app://edaijia/client';
    if (_option.downAndroid) {

      this.downAndroid = _option.downAndroid;

    } else {

      throw new Error('Download模块初始化时，没传Android安装包的下载地址。');

    }
    this.downWinPhone = _option.downWinPhone || 'http://www.windowsphone.com/zh-cn/store/app/e代驾/ee8abf90-f100-4cf3-91c5-29af904f0204';
    this.downOther = _option.downOther || "http://wap.edaijia.cn";
    this.downWeixin = _option.downWeixin;

  };

  Download.prototype.init = function() {

    var _this = this;

    if (edj.isClient) { // 如果页面在客户端里面打开，则 下载/唤起客户端 功能失效。

      return false;

    }

    _onClick = function() {

      _this._onClick();

    };

    $("body").on('tap', _this.btn, _onClick);

  };

  Download.prototype.off = function() {

    var _this = this;

    $("body").off('tap', _this.btn, _onClick);

    _onClick = null;

  };

  Download.prototype._onClick = function() {

    var _this = this;

    if (edj.isWeixin && _this.downWeixin && $.isFunction(_this.downWeixin)) {

      _this.downWeixin();

    } else if (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
      var ifr = document.createElement('iframe');
      ifr.src = _this.callIOS;
      ifr.style.display = 'none';
      document.body.appendChild(ifr);
      window.setTimeout(function() {
        window.location = _this.downIOS;
        document.body.removeChild(ifr);
      }, 500);

    } else if (/android/i.test(navigator.userAgent)) {

      var ifr2 = document.createElement('iframe');
      ifr2.src = _this.callAndroid;
      ifr2.style.display = 'none';
      document.body.appendChild(ifr2);
      window.setTimeout(function() {
        window.location = _this.downAndroid;
        document.body.removeChild(ifr2);
      }, 500);

    } else if (/windows|win32/i.test(navigator.userAgent) && _this.downWinPhone) {

      location.href = _this.downWinPhone;

    } else {

      location.href = _this.downOther;

    }
  };


  window.DownloadMod = Download;

})(window, $);
