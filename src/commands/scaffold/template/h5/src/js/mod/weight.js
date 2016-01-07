/**
 * 重力感应
 */
(function() {
  var $weight = $('.mod-weight-cube'),
    turnning = false;
  window.addEventListener('deviceorientation', function(e) {
    if (turnning) {
      return;
    }
    turnning = true;
    setTimeout(function() {
      turnning = false;
    }, 100);

    $weight.css({
      '-webkit-transform': 'rotateZ('+e.alpha+'deg) rotateX('+e.beta+'deg) rotateY('+e.gamma+'deg)'
    });
  });
})();
