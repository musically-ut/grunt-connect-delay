'use strict';

var utils = require('../lib/utils'),
    proxyDelayMsg = 'Proxying was delayed.',
    // Allow 10ms error margins in delays
    errMargin = 10;

function delayShouldBeApprox(startTime, delayShouldBe, test) {
    var endTime     = new Date(),
        actualDelay = endTime - startTime;

    test.ok
      ( Math.abs(actualDelay - delayShouldBe) < errMargin
      , "Delay was: " + actualDelay + " instead of " + delayShouldBe
      );
}

function createAccumulatingLogger(accArrayLogs, accArrayErrors) {
    return {
        ok: function () {
            accArrayLogs.push(Array.prototype.join.call(arguments, ' '));
        },
        error: function () {
            accArrayErrors.push(Array.prototype.join.call(arguments, ' '));
        }
    };
}

exports.logging_tests = {
    setUp: function (done) {
        utils.clearRules();
        done();
    },
    tearDown: function (done) {
        utils.clearRules();
        done();
    },
    testSettingUpLogger: function (test) {
        test.expect(0);
        var logs = [];
        utils.setLogger(createAccumulatingLogger(logs));
        test.done();
    },
    testProxyLogging: function (test) {
        test.expect(4);
        var logs = [], delay = 10;
        utils.setLogger(createAccumulatingLogger(logs));
        utils.registerRule({ url: '/api', delay: delay });
        utils.delayRequest({ url: '/api' }, {}, function () {
            test.equal(logs.length, 2);
            test.equal(logs[1], 'Proxying to "/api" after ' + delay + ' ms.');
            test.done();
        });
        test.equal(logs.length, 1);
        test.equal(logs[0], 'Will proxy to "/api" after ' + delay + ' ms.');
    },
    testErrorMessages: function (test) {
        test.expect(3);
        var logs = [], errors = [];
        utils.setLogger(createAccumulatingLogger(logs, errors));
        utils.registerRule({ url: '/api/([^/]*)/(.*)$', delay: '$1', rewrite: '$2' });
        utils.delayRequest({ url: '/api/notANumber/destination' }, {}, function () {
            test.equal(logs.length, 0);
            test.equal(errors.length, 1);
            test.equal(errors[0], 'Could not parse the delay "$1" from URL: "/api/notANumber/destination"');
            test.done();
        });
    }
};

exports.connect_delay = {
    setUp: function (done) {
        utils.clearRules();
        done();
    },
    tearDown: function (done) {
        utils.clearRules();
        done();
    },
    testRuleRegistration: function (test) {
        test.expect(8);

        test.equal(utils.registerRule(), false);
        var rule = {};
        test.equal(utils.registerRule(rule), false);
        rule.url = '/api';
        test.equal(utils.registerRule(rule), false);
        rule.delay = '1000';
        test.equal(utils.registerRule(rule), false);
        rule.delay = 1000;
        test.notEqual(utils.registerRule(rule), false);
        test.equal(utils.getRules().length, 1);
        test.ok
          ( utils.getRules()[0].url.test('/api')
          , '"/api" did not match the rule'
          );
        test.equal(utils.getRules()[0].delay, rule.delay);

        test.done();
    },
    testRegisteredRuleMessage: function (test) {
        test.expect(1);
        test.equals
          ( utils.registerRule({ url: '/api/.*', delay: 100 })
          , '"/api/.*" by: 100 ms'
          );

        test.done();
    },
    testWithoutRules: function (test) {
        test.expect(1);
        var start = new Date();
        utils.delayRequest({ url: '/anything' }, {}, function () {
            var end = new Date();
            test.ok(Math.abs(end - start) <= 1, proxyDelayMsg);
            test.done();
        });
    },
    testRules: function (test) {
        var asyncTestsExpected = 4,
            syncTestsExpected  = 1;
        test.expect(syncTestsExpected + asyncTestsExpected);

        var start = new Date();
        var delay = 100,
            count = 0,
            oneTestDone = function () {
                count += 1;
                if (count === asyncTestsExpected) {
                    test.done();
                }
            };

        test.notEqual
          ( utils.registerRule({ url: '^/api/.*/delay.gif', delay: delay })
          , false
          );

        utils.delayRequest({ url: '/should-not-match' }, {}, function () {
            delayShouldBeApprox(start, 1, test);
            oneTestDone();
        });
        utils.delayRequest({ url: '/api/images/delay.gif' }, {}, function () {
            delayShouldBeApprox(start, delay, test);
            oneTestDone();
        });
        utils.delayRequest({ url: '/api/scripts/delay.gif' }, {}, function () {
            delayShouldBeApprox(start, delay, test);
            oneTestDone();
        });
        utils.delayRequest({ url: ' /api/files/delay.gif' }, {}, function () {
            // Does not match!
            delayShouldBeApprox(start, 1, test);
            oneTestDone();
        });
    },
    testRegisterExtendedRule: function (test) {
        test.expect(2);
        utils.registerRule({
            url     : '^/test/([0-9]*)/(.*)$'
          , delay   : '$1'
          , rewrite : '/$2'
        });

        var res = { url: '/test/100/other_call' },
            start = new Date();
        utils.delayRequest(res, {}, function () {
            delayShouldBeApprox(start, 100, test);
            test.equal(res.url, '/other_call');
            test.done();
        });
    },
    testRegisterExtendedRuleFixedDelay: function (test) {
        test.expect(2);
        utils.registerRule({
            url     : '^/test/([0-9]*)/(.*)$'
          , delay   : 100
          , rewrite : '/$2'
        });

        var res = { url: '/test/100/other_call' },
            start = new Date();
        utils.delayRequest(res, {}, function () {
            delayShouldBeApprox(start, 100, test);
            test.equal(res.url, '/other_call');
            test.done();
        });
    },
    testDefaultRule: function (test) {
        test.expect(2);
        utils.registerRule(utils.defaultRule);
        var res = { url: '/delay/100/original_url' },
            start = new Date();
        utils.delayRequest(res, {}, function () {
            delayShouldBeApprox(start, 100, test);
            test.equal(res.url, '/original_url');
            test.done();
        });

    }
};


