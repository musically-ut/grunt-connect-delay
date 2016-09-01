# grunt-connect-delay [![Build Status](https://travis-ci.org/musically-ut/grunt-connect-delay.png?branch=master)](https://travis-ci.org/musically-ut/grunt-connect-delay)

> A delay proxy middleware for grunt-contrib-connect

This plugin provides a delay middleware for Grunt Connect / Express. It can be
used for introducing artificial delays before proxying certain URLs based on
RegExp rules.

By default, it includes the rule that any URL which matches the pattern
`^/delay/([0-9]+)/(.*)$` will be delayed by `$1` milliseconds and be redirected
to `/$2`.

Hence, to check your app's behavior when a particular request is slow, just
prefix `/delay/5000/` to the URL.

## Getting started

This plugin requires Grunt `>=0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out
the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains
how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as
install and use Grunt plugins.

```shell
npm install grunt-connect-delay --save-dev
```

### Options

##### useDefaultRule
Type: `Boolean`

Default Value: `true`

This adds the following default rule to the configuration:

```js
{ rule    : '/delay/([0-9])+/(.*)$'
, delay   : '$1'
, rewrite : '/$2'
}
```

This means that to delay a link, you only need to prefix it with
`/delay/:milliseconds/<original URL>`. `grunt-connect-delay` will wait for the
said number of milliseconds before proceeding to the `<original URL>`

##### rulesProvider
Type: `String`

Default value: `connect.delay`

This is the section in the Gruntfile from where the delay rules will be read.

##### Simple rule format

`{url: 'FROM', delay: MILLISECONDS }`

Where:
 * `FROM`: RegExp string to match
 * `MILLISECONDS`: The delay in milliseconds to introduce before proceeding with proxying


##### Extended rule format

`{url: 'FROM_REGEXP', delay: 'NUMBER_OR_REPLACEMENT', rewrite: 'REPLACEMENT' }`

Where:
 - `FROM_REGEXP`: RegExp string to match the URL and create _groups_ to be used for deducing `delay` and the true proxied URL. e.g. `^/delay/([0-9]*)/(.*)$`.
 - `NUMBER_OR_REPLACEMENT`: The number of milliseconds (e.g. `1000`) to wait or a string which can be parsed to an integer after a URL (which matches `url`) is replaced by it (e.g. `$1`).
 - `REPLACEMENT`: A string which maps to the destination URL after a URL is replaced by it (e.g. `/$2`).


#### Usage

In your project's Gruntfile:
 * Include the `delayRequest` snippet: `var delayRequest = require('grunt-connect-delay/lib/utils').delayRequest`.
 * Load the plugin: `grunt.loadNpmTasks('grunt-connect-delay')`
 * Add `configureDelayRules` before the web server task.

Optional (advanced usage):
 * Configure options in `configureDelayRules.options` in `initConfig`, or,
 * Add a section named `delay` to your existing Connect definition

To see some logs about the proxying, use the `--verbose` flag while running
`grunt`.

```js
var delayRequestSnippet = require('grunt-connect-delay/lib/utils').delayRequest;
grunt.initConfig({
    connect: {
        delay: [
            { url: '^/api/.*$', delay: 10000 } // Delay calls to API by 10sec
        ],
        dev: {
            options: {
                middleware: function (connect, options, middlewares) {
                    middlewares.unshift(delayRequestSnippet);
                    return middlewares;

                    // Old style:
                    // See: https://github.com/gruntjs/grunt-contrib-connect/issues/114
                    // 
                    // return [
                    //        delayRequestSnippet
                    //      , rewriteRequestSnippet
                    //      , proxyRequestSnippet
                    //      , connect.static(path.resolve(dir))
                    // ];
                }
            }
        }
    },
    /* Optional */
    configureDelay: {
        options: {
            rulesProvider  : 'connect.delay'
          , useDefaultRule : true
        }
    }
});

grunt.loadNpmTasks('grunt-contrib-connect');
grunt.loadNpmTasks('grunt-connect-delay');

// "configureDelayRules" should be before the "connect"/"express" task
grunt.registerTask('server', function (target) {
    grunt.task.run([
        'configureDelayRules',
        'connect:dev'
    ]);
});
```

Though I haven't tested it, it should work in a similar fashion with
`grunt-express` task as well.

You can see how to use this plugin at 
[musically-ut/grunt-connect-delay-example](https://github.com/musically-ut/grunt-connect-delay-example).

### Credits

The structure and documentation of this plugin is inspired by
[`grunt-connect-rewrite` plugin](https://github.com/viart/grunt-connect-rewrite).

### Release Notes
 - _0.2.4_: Updated peerDependency to support grunt >=1.0.0
 - _0.2.3_: Update usage instuctions
 - _0.2.2_: Bump version to resolve `npm` bug
 - _0.2.1_: Improve documentation
 - _0.2.0_: Add extended rules and a default rule
 - _0.1.1_: Improve logging
 - _0.1.0_: Initial release
