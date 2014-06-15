/*
 * grunt-connect-delay
 *
 * Copyright (c) 2014 Utkarsh Upadhyay
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            tdd: {
                files: [ '**/*.js' ]
              , tasks: [ 'jshint', 'nodeunit' ]
            }
        },
        jshint: {
            all: [ 'Gruntfile.js'
                 , 'tasks/*.js'
                 , '<%= nodeunit.tests %>'
                 ],
            options: { jshintrc: '.jshintrc' }
        },
        clean: { tests: [ 'tmp' ] },

        connect: {
            options: {
                port: 8123,
                hostname: 'localhost'
            },
            delay: [
                {url: '^/api.*$', delay: 10000}
            ]
        },
        configureDelayRules: {
            options: {
                rulesProvider: '/api'
            }
        },
        nodeunit: {
            tests: [ 'test/*_test.js' ]
        }
    });

    // Load grunt-connect-delay
    grunt.loadTasks('tasks');

    // Dependencies
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'configureDelayRules', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test', 'watch:tdd']);
};
