# grunt-connect-delay [![Build Status](https://travis-ci.org/musically-ut/grunt-connect-delay.png?branch=master)](https://travis-ci.org/musically-ut/grunt-connect-delay)


This plugin provides a delay middleware for Grunt Connect / Express. It can be
used for introducing artificial delays before proxying certain URLs based on
RegExp rules.

By default, it includes the rule that any URL which matches the pattern
`^/delay/([0-9]+)/(.*)$` will be delayed by `$1` milliseconds and be redirected
to `/$2`.

Hence, to check your app's behavior when a particular request is slow, just
prefix `/delay/5000/` to the URL.

## Getting started

This plugin requires Grunt `~0.4.1`

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

`{url: '__from__', delay: __milliseconds__}`

Where:
 * `__from__`: RegExp string to match
 * `__milliseconds__`: The delay in milliseconds to introduce before proceeding with proxying


##### Extended rule format

`{url: '__from_regexp__', delay: '__number_or_replacement__', rewrite: '__replacement__' }`

Where:
 - `__from_regexp__`: RegExp string to match the URL and create _groups_ to be used for deducing `delay` and the true proxied URL. e.g. `^/delay/([0-9]*)/(.*)$`.
 - `__number_or_replacement__`: The number of milliseconds (e.g. `1000`) to wait or a string which can be parsed to an integer after a URL (which matches `url`) is replaced by it (e.g. `$1`).
 - `__replacement__`: A string which maps to the destination URL after a URL is replaced by it (e.g. `/$2`).


#### Usage

In your project's Gruntfile:
 * Include the `delayRequest` snippet: `var delayRequest = require('grunt-connect-delay/lib/utils').delayReuest`.
 * Add a section named `delay` to your existing Connect definition:
 * Load the plugin: `grunt.loadNpmTasks('grunt-connect-delay')`
 * Add `configureDelayRules` before the web server task.

To see some logs about the proxying, use the `--verbose` flag while running
`gurnt`.

```js
var delayRequestSnippet = require('grunt-connect-delay/lib/utils').delayRequest;
grunt.initConfig({
    connect: {
        delay: [
            { url: '^/api/.*$', delay: 10000 } // Delay calls to API by 10sec
        ],
        dev: {
            options: {
                middleware: function (connect) {
                    return [
                           delayRequestSnippet
                      // , rewriteRequestSnippet
                      // , proxyRequestSnippet
                      // , connect.static(path.resolve(dir))
                    ];
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

### Credits

The structure and documentation of this plugin is inspired by
[`grunt-connect-rewrite` plugin](https://github.com/viart/grunt-connect-rewrite).

### Release Notes

 - `0.1.1`: Improve logging
 - `0.1.0`: Initial release
