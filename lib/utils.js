/*
 * grunt-connect-delay
 * https://github.com/musically-ut/grunt-connect-delay
 *
 * Copyright (c) 2014 Utkarsh Upadhyay
 * Licensed under the MIT license.
 */

'use strict';

var utils = module.exports,
    rules = [],
    logger = { ok: function () {}, error: function () {} };

// Handling rules
//////////////////

function isValidExtendedRule(rule) {
    return ( typeof rule       === 'object' &&
             typeof rule.url   === 'string' &&
             ( typeof rule.delay === 'number' ||
               typeof rule.delay === 'string' ) &&
             typeof rule.rewrite === 'string'
           );
}

function isValidSimpleRule(rule) {
    return ( typeof rule       === 'object' &&
             typeof rule.url   === 'string' &&
             typeof rule.delay === 'number'
           );
}

utils.registerRule = function (rule) {

    if (!isValidSimpleRule(rule) && !isValidExtendedRule(rule)) {
        return false;
    }

    rules.push({ url     : new RegExp(rule.url)
               , delay   : rule.delay
               , rewrite : rule.rewrite
               });

    return '"' + rule.url + '" by: ' + rule.delay + ' ms' +
            (typeof rule.rewrite === 'undefined' ?
                 ''
               : ' to: ' + rule.rewrite
            );
};

utils.defaultRule = { url     : '^/delay/([0-9]+)/(.*)$'
                    , delay   : '$1'
                    , rewrite : '/$2'
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

            var rule      = rules[ii],
                isInError = false;

            var delay = rule.delay, destUrl = req.url;

            if (typeof rule.rewrite === 'string') {
                destUrl = destUrl.replace(rule.url, rule.rewrite);

                // This is an extended rule which requires re-writing
                if (typeof rule.delay === 'string') {
                    delay = parseInt(req.url.replace(rule.url, rule.delay));

                    if (isNaN(delay)) {
                        logger.error
                            ( 'Could not parse the delay "' + rule.delay
                            + '" from URL: "' + req.url + '"'
                            );
                        isInError = true;
                    }
                } // Else the delay was a fixed number
            }

            if (!isInError) {

                req.url = destUrl;
                logger.ok
                   ( 'Will proxy to "'
                   + req.url
                   + '" after '
                   + delay
                   + ' ms.'
                   );

                setTimeout(logAndProxy(req.url, delay, next), delay);
                proxied = true;
            }

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
