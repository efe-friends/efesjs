/**
 * CallClient mod
 * 采用 class 的形式，是为了方便可以创建多个实例，为多个不同的按钮绑定下载功能。
 * 调用方式1：
 * var ccm = new CallClientMod({
 *   clientPage: '', // 客户端内部唤起页面
 *   btn: '' // 按钮，jquery对象选择器，如：'#J-call-client', '.J-call-client'。默认为：'.J-call-client'
 * });
 * ccm.init(); // 为按钮绑定 调用客户端特定页面/功能 点击事件
 *
 * 调用方式2：
 * var ccm = new CallClientMod("goto", ".J-call-client", {
 *   page: '', // 客户端内部唤起页面(此处跟进第一个参数，传对应的data)
 * });
 * ccm.init(); // 为按钮绑定 调用客户端特定页面/功能 点击事件
 *
 * 
 * ccm.off(); // 解除按钮的 调用客户端特定页面/功能 点击事件
 *
 * // 用于不需要通过点击按钮触发的功能，第二个参数必须为：false
 * new CallClientMod("initShareData", false, wxData);
 * 
 */
(function(window, $) {

  var _onClick = $.noop;

  function webViewJSBridgeReady(callback) {
    if (window.WebViewJavascriptBridge) {
      callback(WebViewJavascriptBridge);
    } else {
      document.addEventListener('WebViewJavascriptBridgeReady', function() {
        callback(WebViewJavascriptBridge);
      }, false);
    }
  }

  var CallClient = function(option, btn, data) {

    var _this = this;

    if ($.isPlainObject(option)) {
      this.act = "goto";

      this.data = {
        page: option.clientPage
      };

      this.btn = option.btn || ".J-call-client";

    } else if (typeof option === 'string') {

      this.act = option;

      this.btn = btn === false ? false : typeof btn === "string" && btn || ".J-call-client";

      this.data = data && $.isPlainObject(data) ? data : {};

      if (this.btn === false) {

        webViewJSBridgeReady(function(bridge) {

          bridge.callHandler(_this.act, _this.data);

        });

      }

    }

  };

  CallClient.prototype.init = function() {

    var _this = this;

    if (!edj.isClient) {

      return false;

    }

    _onClick = function() {

      _this._onClick();

    };

    $('body').on('click', _this.btn, _onClick);

  };

  CallClient.prototype.off = function() {

    var _this = this;

    $('body').off('click', _this.btn, _onClick);

    _onClick = null;

  };

  CallClient.prototype._onClick = function() {

    var _this = this;

    webViewJSBridgeReady(function(bridge) {
      _this.btn.on('click', function() {
        bridge.callHandler(_this.act, _this.data);
      });
    });

  };

  window.CallClientMod = CallClient;

})(window, $);
