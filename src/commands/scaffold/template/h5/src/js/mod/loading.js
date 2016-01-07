(function(window, $) {

  var loading = {
    init : function() {
      this.$wraper = $(".loading");
      this.$wraper.on('click tap', function() {
        loading.hide();
      });
    },
    hide: function() {
      this.$wraper
        .hide()
        .addClass('paused');
    },
    show: function() {
      this.$wraper
        .removeClass('paused')
        .show();
    }
  };

  loading.init();

  window.loading = loading;

})(window, $);
