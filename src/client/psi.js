"use stack";
(function() {
    var ckpsi = require('./model/psi/psi.js');

    exports.psi = function(options) {
        ckpsi.scan('http://h5.d.edaijia.cn/app/index.html');
    };
})();
