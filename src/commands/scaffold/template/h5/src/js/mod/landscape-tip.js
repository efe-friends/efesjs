/**
 * 横屏提示，通过给html标签上添加如下class控制
 * landscape 横屏模式
 * portrait 竖屏模式
 * 示例中通过控制 .mod-landscape-tip 这个模块的显示影藏来实现。
 */
(function() {
  var supportsOrientation = typeof window.orientation === 'number' && typeof window.onorientationchange === 'object';
  var HTMLNode = document.body.parentNode;
  var updateOrientation = function() {
    // rewrite the function depending on what's supported
    if (supportsOrientation) {
      updateOrientation = function() {
        var orientation = window.orientation;

        switch (orientation) {
          case 90:
          case -90:
            orientation = 'landscape';
            break;
          default:
            orientation = 'portrait';
        }

        // set the class on the HTML element (i.e. )
        HTMLNode.setAttribute('class', orientation);
      };
    } else {
      updateOrientation = function() {
        // landscape when width is biggest, otherwise portrait
        var orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

        // set the class on the HTML element (i.e. )
        HTMLNode.setAttribute('class', orientation);
      };
    }

    updateOrientation();
  };
  var init = function() {
    // initialize the orientation
    updateOrientation();

    if (supportsOrientation) {
      window.addEventListener('orientationchange', updateOrientation, false);
    } else {
      // fallback: update every 5 seconds
      setInterval(updateOrientation, 5000);
    }

  };
  window.addEventListener('DOMContentLoaded', init, false);
})();
