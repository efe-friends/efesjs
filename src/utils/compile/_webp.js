(function() {

  const fs = require('fs');
  const async = require('async');
  const chalk = require('chalk');
  const ExecBuffer = require('exec-buffer');
  const isCwebpReadable = require('is-cwebp-readable');
  const replaceExt = require('replace-ext');
  const webp = require('cwebp-bin');

  const fsp = require('../../../../utils/fs.js');
  const walk = require('../../../../utils/walk.js');
  const path = require('../../../../utils/path.js');


  module.exports = function(input, dir, options, callback) {
    let opts = options || {};

    let file = fsp.readFileSync(path.join(dir, input));

    if (file.isNull()) {
      callback(null, file);
      return;
    }

    if (file.isStream()) {
      callback(new Error('Streaming is not supported'));
      return;
    }

    if (!isCwebpReadable(file.contents)) {
      callback(null, file);
      return;
    }

    var execBuffer = new ExecBuffer();
    var args = ['-quiet', '-mt'];

    if (opts.preset) {
      args.push('-preset', opts.preset);
    }

    if (opts.quality) {
      args.push('-q', opts.quality);
    }

    if (opts.alphaQuality) {
      args.push('-alpha_q', opts.alphaQuality);
    }

    if (opts.method) {
      args.push('-m', opts.method);
    }

    if (opts.size) {
      args.push('-size', opts.size);
    }

    if (opts.sns) {
      args.push('-sns', opts.sns);
    }

    if (opts.filter) {
      args.push('-f', opts.filter);
    }

    if (opts.autoFilter) {
      args.push('-af');
    }

    if (opts.sharpness) {
      args.push('-sharpness', opts.sharpness);
    }

    if (opts.lossless) {
      args.push('-lossless');
    }

    execBuffer
      .use(webp, args.concat([execBuffer.src(), '-o', execBuffer.dest()]))
      .run(file.contents, function (err, buf) {
        if (err) {
          err.fileName = file.path;
          callback(err);
          return;
        }

        file.path = replaceExt(file.path, '.webp');
        file.contents = buf;
        callback(null, file);
      });

  };

})();
