"use strict";
(function() {

    var psi = require('psi');

    var ckpsi = {

        scan: function(uri) {
            // get the PageSpeed Insights report
            psi(uri, {
                locale: "zh_CN"
            }, function(error, data) {
                //console.log(error);
                //console.log(data);
                for(var i in data.formattedResults.ruleResults){
                    console.log(data.formattedResults.ruleResults[i]);
                }
                //console.log(data.pageStats);
            });

            // output a formatted report to the terminal
            psi.output(uri, function(error) {
                console.log('done');
            });
        }
    };

    module.exports = ckpsi;

})();
