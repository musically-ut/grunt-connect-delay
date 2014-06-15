/*
 * grunt-connect-rewrite
 *
 * Copyright (c) 2014 Utkarsh Upadhyay
 * Licensed under the MIT license.
 */

'use strict';

var utils = module.exports,
    rules = [];

utils.registerRule = function (rule) {
    if (typeof rule       !== 'object' ||
        typeof rule.url   !== 'string' ||
        typeof rule.delay !== 'number') {
        return false;
    }

    rules.push({url: new RegExp(rule.url) , delay: rule.delay });

    return '"' + rule.url + '" by: ' + rule.delay + ' ms';
};

utils.getRules = function () {
    return rules;
};

utils.clearRules = function () {
    rules = [];
};

utils.delayRequest = function (req, res, next) {
    var proxied = false;
    for (var ii = 0; ii < rules.length; ii++) {
        if (rules[ii].url.test(req.url)) {
            // If there was a match, then schedule progress after
            // the provided delay
            setTimeout(function () { next(); }, rules[ii].delay);
            proxied = true;
            break;
        }
    }

    // If there was no match, continue immediately
    if (!proxied) {
        next();
    }
};
