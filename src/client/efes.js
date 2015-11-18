"use strict";

(function() {

    var info = require('../info');

    var nopt = require('nopt');
    var path = require('path');


    // This is only executed when run via command line.
    var efes = module.exports = function() {
        // Run tasks.
        if (efes.tasklist[efes.task]) {
            require('./' + efes.task)[efes.task](efes.options);
            return;
        }
        if (efes.options.version) {
            info.version();
            return;
        }

        if (efes.task.indexOf('help') === 0) {
            info.help('efes', efes.task[1]);
            return;
        }
        if (efes.task.length) {
            info.fatal('\'' + efes.task + '\' is not a efes command');
            return;
        }
        info.fatal('No command provided');
    };

    // Default options.
    var optlist = efes.optlist = {
        base: {
            shorts: 'b',
            info: 'Path to the target dir.',
            type: path
        },
        force: {
            shorts: 'f',
            info: 'Force run command.',
            type: Boolean
        },
        help: {
            shorts: 'h',
            info: 'Display this help text.',
            type: Boolean
        },
        stack: {
            shorts: 's',
            info: 'Show error stack.',
            type: Boolean
        },
        version: {
            shorts: 'v',
            info: 'Print the efes version.',
            type: Boolean
        }
    };

    efes.tasklist = {
        hook: {
            args: [],
            info: 'Generate git/svn pre-commit hooks.'
        },
        commit: {
            args: [],
            info: 'Run pre commit process on committing.'
        },
        init: {
            args: ['force'],
            info: 'Generate project scaffolding.'
        },
        psi: {
            args: [],
            info: 'PageSpeed Insights .'
        },
        pull: {
            args: [],
            info: 'Clone/update all local git repositories.'
        },
        help: {
            args: [],
            info: 'help.'
        },
        test: {
            args: [],
            info: 'Run test with Karma.'
        }
    };

    // Parse `optlist` into a form that nopt can handle.
    var aliases = {};
    var known = {};

    Object.keys(optlist).forEach(function(key) {
        var shorts = optlist[key].shorts;
        if (shorts) {
            aliases[shorts] = '--' + key;
        }
        known[key] = optlist[key].type;
    });

    var parsed = nopt(known, aliases, process.argv, 2);
    efes.task = parsed.argv.remain;
    efes.options = parsed;
    delete parsed.argv;
    if (!efes.options.base) {
        efes.options.base = process.cwd();
    }
})();
