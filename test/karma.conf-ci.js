// Karma configuration
module.exports = function (config) {
  // Browsers to run on Sauce Labs
  // Check out https://saucelabs.com/platforms for all browser/OS combos
  const customLaunchers = {
    iOS92: {
      base: 'SauceLabs',
      platform: 'OS X 10.11',
      browserName: 'iphone',
      version: '9.2'
    },

    // Android51: {
    //   base: 'SauceLabs',
    //   platform: 'Android',
    //   browserName: 'android',
    //   version: '5.1',
    //   deviceName: 'Android Emulator',
    //   deviceType: 'phone'
    // },
    // Android44: {
    //   base: 'SauceLabs',
    //   platform: 'Android',
    //   browserName: 'android',
    //   version: '4.4',
    //   deviceName: 'Android Emulator',
    //   deviceType: 'phone'
    // },
    // Android23: {
    //   base: 'SauceLabs',
    //   platform: 'Android',
    //   browserName: 'android',
    //   version: '2.3',
    //   deviceName: 'Android Emulator',
    //   deviceType: 'phone'
    // },

    MacChrome: {
      base: 'SauceLabs',
      platform: 'OS X 10.11',
      browserName: 'chrome',
      customData: {
        awesome: true
      }
    },
    MacFirefox: {
      base: 'SauceLabs',
      platform: 'OS X 10.11',
      browserName: 'firefox'
    },
    MacSafari: {
      base: 'SauceLabs',
      platform: 'OS X 10.11',
      browserName: 'safari'
    },
    Windows10IE: {
      base: 'SauceLabs',
      platform: 'Windows 10',
      browserName: 'internet explorer'
    },
    Windows8IE: {
      base: 'SauceLabs',
      platform: 'Windows 8',
      browserName: 'internet explorer'
    }
  };

  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'mocha', 'chai'],

    // list of files / patterns to load in the browser
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'src/**/*.js',
      'test/setup.js',
      'test/specs/**/*.js'
    ],

    // list of files to exclude
    exclude: [
      'src/shims/**/*.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.js': ['browserify'],
      'test/setup.js': ['browserify'],
      'test/specs/**/*.js': ['browserify']
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Configure browserify preprocessor
    browserify: {
      debug: true,
      transform: [
        ['babelify', {
          global: true,
          comments: false,
          presets: ['es2015', 'stage-2'],
          ignore: /\/node_modules\/(?!qs\/)/ // Ignore all node_modules except qs
        }],
        'envify'
      ]
    },

    // SauceLabs
    // Used to run unit tests on several browsers
    sauceLabs: {
      username: process.env.SAUCELABS_USERNAME,
      accessKey: process.env.SAUCELABS_ACCESSKEY,
      testName: 'Kinvey JavaScript Library Unit Tests'
    },
    customLaunchers: customLaunchers,

    // start these browsers
    browsers: Object.keys(customLaunchers),

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'saucelabs'],

    // Increase timeout in case connection in CI is slow
    captureTimeout: 300000
  });
};
