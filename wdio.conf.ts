import type { Options } from '@wdio/types'
export const config: Options.Testrunner = {
    //
    // ====================
    // Runner Configuration
    // ====================
    // WebdriverIO supports running e2e tests as well as unit and component tests.
    // runner: 'local',
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            project: './tsconfig.json',
            transpileOnly: true
        }
    },

    specs: [
        './test/specs/bupa_healthcare.spec.ts'
    ],
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],

    maxInstances: 3,
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://saucelabs.com/platform/platform-configurator
    //

    capabilities: [
        {
            browserName: 'chrome',
            'bstack:options': {
                deviceOrientation: 'portrait',
                deviceName: 'Google Pixel 6',
                osVersion: '12.0'
            }
        },
        {
            browserName: 'safari',
            'bstack:options': {
                deviceOrientation: 'portrait',
                deviceName: 'iPhone 12 Mini',
                osVersion: '16'
            }
        },
        {
            browserName: 'Safari',
            'bstack:options': {
                browserVersion: '12.1',
                os: 'OS X',
                osVersion: 'Mojave'
            }
        },
    ],

    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'error',
    //
    // Set specific log levels per logger
    // loggers:
    // - webdriver, webdriverio
    // - @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
    // - @wdio/mocha-framework, @wdio/jasmine-framework
    // - @wdio/local-runner
    // - @wdio/sumologic-reporter
    // - @wdio/cli, @wdio/config, @wdio/utils
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    // logLevels: {
    //     webdriver: 'info',
    //     '@wdio/appium-service': 'info'
    // },
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    baseUrl: 'https://bupa.com',

    // Default timeout for all waitFor* commands.
    waitforTimeout: 60000,
    //
    // Default timeout in milliseconds for request
    // if browser driver or grid doesn't send response
    connectionRetryTimeout: 300000,
    //
    // Default request retries count ./cm selenoid download --version 1.2.1 --force
    connectionRetryCount: 3,
    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They enhance
    // your test setup with almost no effort. Unlike plugins, they don't add new
    // commands. Instead, they hook themselves up into the test process.
    hostname: 'hub.browserstack.com',
    user: process.env.BROWSERSTACK_USERNAME || 'lavanya_5GhXKO',
    key: process.env.BROWSERSTACK_ACCESS_KEY || 'nEy3zAzzsEph7sJ8P2N1',
    services: [
        ['browserstack', {
            testObservability: true,
            testObservabilityOptions: {
                projectName: "V5Demo",
                buildName: "Wdio browserstack sample build",
                debug: "true",
                networkLogs: "true",
                consoleLogs: "info"
            },
            browserstackLocal: true,
            opts: {
                forcelocal: false,
            }
        }]
    ],

    framework: 'mocha',

    reporters: ['spec'],

    mochaOpts: {
        ui: 'bdd',
        timeout: 180000
    },
}

exports.config.capabilities.forEach(function (caps) {
    for (let i in exports.config.commonCapabilities)
        caps[i] = { ...caps[i], ...exports.config.commonCapabilities[i] };
})
