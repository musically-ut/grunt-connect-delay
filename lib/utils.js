/*
 * grunt-connect-rewrite
 * https://github.com/musically-ut/grunt-connect-delay
 *
 * Copyright (c) 2014 Utkarsh Upadhyay
 * Licensed under the MIT license.
 */

'use strict';

var utils = module.exports,
    rules = [],
    logger = { ok: function () {} };

// Handling rules
//////////////////

utils.registerRule = function (rule) {
    if (typeof rule       !== 'object' ||
        typeof rule.url   !== 'string' ||
        typeof rule.delay !== 'number') {
        return false;
    }

    rules.push({url: new RegExp(rule.url) , delay: rule.delay });

    return '"' + rule.url + '" by: ' + rule.delay + ' ms';
};

/* These functions aid in testing this module */
utils.getRules = function () {
    return rules;
};

utils.clearRules = function () {
    rules = [];
};

/* Set up the logging */
utils.setLogger = function (externalLogger) {
    logger = externalLogger;
};


/* This is the snippet which is used as the middleware in the external
 * Gruntfile functions aid in testing this module.
 */
function logAndProxy(url, delay, next) {
    return function () {
        logger.ok('Proxying to "' + url + '" after ' + delay + ' ms.');
        next();
    };
}

utils.delayRequest = function (req, res, next) {
    var proxied = false;
    for (var ii = 0; ii < rules.length; ii++) {
        if (rules[ii].url.test(req.url)) {
            // If there was a match, then schedule progress after the delay

            logger.ok('Will proxy to "' + req.url + '" after ' + rules[ii].delay + ' ms.');
            setTimeout(logAndProxy(req.url, rules[ii].delay, next), rules[ii].delay);
            proxied = true;

            // Do no proxy the same call twice.
            // Proxy after the first rule match rule match.
            break;
        }
    }

    // If there was no match, continue immediately
    if (!proxied) {
        next();
    }
};
