/*
 * grunt-connect-delay
 *
 * Copyright (c) 2014 Utkarsh Upadhyay
 * Licensed under the MIT license.
 */

'use strict';

var utils = require('../lib/utils');

module.exports = function (grunt) {
    grunt.registerTask('configureDelayRules', 'Configure connect delay rules.', function () {
        var options = this.options({
            rulesProvider: 'connect.delay'
        });
        utils.log = grunt.log;
        (grunt.config(options.rulesProvider) || []).forEach(function (rule) {
            rule = rule || {};
            var registeredRule = utils.registerRule({
                url: rule.url,
                delay: rule.delay
            });

            if (registeredRule) {
                grunt.log.ok('Delay rule created for: [' + registeredRule +'].');
            } else {
                grunt.log.error('Incorrect delay rule given.');
            }
        });
    });
};
