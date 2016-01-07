(function() {

  /* --- loading调用示例 start--- */
  $('.J-s-loading').on('click', function() {
    loading.show(); //show除了会显示loading层之外，还可以做些其他处理，如给隐藏加动画效果等。
  });
  $('.J-h-loading').on('click', function() {
    loading.hide(); //hide操作如上
  });
  /* --- loading调用示例 start--- */


{{if modCallClient}}
  /* --- 客户端内部调用原生功能 start--- */
  /**
   * CallClient mod
   * 采用 class 的形式，是为了方便可以创建多个实例，为多个不同的按钮绑定下载功能。
   * 调用方式1：
   * var ccm = new CallClientMod({
   *   clientPage: '', // 客户端内部唤起页面
   *   btn: '' // 按钮，jquery对象选择器，非必填，如：'#J-call-client', '.J-call-client'。默认为：'.J-call-client'
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
  var ccm = new CallClientMod({
    clientPage: "edaijia://5"
  });

  ccm.init();
  /* --- 客户端内部调用原生功能 end--- */
{{/if}}
{{if modDownload}}
  /* --- 唤起客户端或跳转到下载 start--- */
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
  var dlm = new DownloadMod({
    downAndroid: "http://aaa.apk"
  });

  dlm.init();
  /* --- 唤起客户端或跳转到下载 start--- */
{{/if}}

  /* --- 分享 start--- */
  {{if modWeixin}}
  edj.initWXShare(wxData); //微信分享
  {{/if}}

  {{if modCallClient}}
  new CallClientMod("initShareData", false, wxData); //客户端分享
  {{/if}}
  /* --- 分享 end--- */
  {{if modScroll}}
  /* --- 滑屏 start--- */
  /**
   * 滑屏插件
   * 需要禁用touchmove事件。
   * 调用方式：
   * var pager = PageTransitions({
   *   main: $("#main"),            // 默认值：$("#main")
   *   nextBtns: $('.iter-next'),   // 默认值：$('.iter-next')
   *   preBtns: $('.iter-pre'),     // 默认值：$('.iter-pre')
   *   pageClass: '.page',          // 默认值：.page
   *   nextEvent: 'swipeUp',        // 默认值：swipeUp
   *   nextType: 3,                 // 默认值：3 
   *   prevEvent: 'swipeDown',      // 默认值：swipeDown
   *   prevType: 4,                 // 默认值：4
   *   nextCallback: function(i) {
   *     console.log('next:'+i);
   *   },
   *   prevCallback: function(i) {
   *     console.log('prev:'+i);
   *   }
   * });
   * 如果使用默认的id、class、默认的切换效果以及不需要回调，调用方式可以简化为：
   * var pager = PageTransitions({});
   */
  /* 禁止滑动 */
  $(document).on('touchmove', function(e) {
    e.preventDefault();
    return false;
  });

  /*var pager = PageTransitions();*/

  var pager = PageTransitions({
    nextCallback: function(i) {
      console.log('next:' + i);
      {{if modWebp}}$('.p'+(i+2)).webp();{{/if}}
    },
    prevCallback: function(i) {
      console.log('prev:' + i);
    }
  });
  /* --- 滑屏 end--- */
  {{/if}}
  {{if modWebp}}
  /* --- webp start--- */
  /**
   * webp插件
   * 调用方式1：
   * $.webp();
   * 处理所有的有 lsrc 属性，且lsrc属性的目录中包含 images 目录的标签。
   * 如果是img标签，则赋值src属性，其他类型的标签修改background-image属性。
   *
   * 调用方式2:
   * $('.p3').webp({
   *   origSrc: "lsrc", // 用于存放图片原文件地址（png,jpg,jpeg,gif)的标签属性
   *   origDir: "images",// 图片原文件根目录，会替换为webp的根目录
   *   webpDir: "webps"// 图片原webp文件目录
   * });
   * 查找处理 .page.p3 这个dom节点下所有有 lsrc 属性，且lsrc属性的目录中包含 images 目录的标签。
   * 处理过程同上。
   *
   * 注意：由于采用lsrc的形式，所以img标签不要设定src属性，防止重复加载。
   * 对于设置了背景图片的标签，请将css中的background-image单独拎出来注释掉。
   */

  {{if modScroll}}
  //$.webp();
  $('.p1').webp();
  $('.p2').webp();
  {{else}}
  $.webp();
  {{/if}}

  /* --- webp end--- */
  {{/if}}

})();
