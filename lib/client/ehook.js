"use strict";

(function() {

    var info = require('../info');

    var nopt = require('nopt');
    var path = require('path');


    // This is only executed when run via command line.
    var ehook = module.exports = function() {
        // Run tasks.
        if (ehook.tasklist[ehook.task]) {
            require('./' + ehook.task)[ehook.task](ehook.options);
            return;
        }
        if (ehook.options.version) {
            info.version();
            return;
        }

        if (ehook.task.indexOf('help') === 0) {
            info.help('ehook', ehook.task[1]);
            return;
        }
        if (ehook.task.length) {
            info.fatal('\'' + ehook.task + '\' is not a ehook command');
            return;
        }
        info.fatal('No command provided');
    };

    // Default options.
    var optlist = ehook.optlist = {
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
            info: 'Print the ehook version.',
            type: Boolean
        }
    };

    ehook.tasklist = {
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
    ehook.task = parsed.argv.remain;
    ehook.options = parsed;
    delete parsed.argv;
    if (!ehook.options.base) {
        ehook.options.base = process.cwd();
    }
})();
