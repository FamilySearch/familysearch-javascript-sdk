/*jshint camelcase:false */
var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/Spec\.js$/.test(file) || /test\/unit\/helpers\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base/src',

  paths: {
    'jquery': '../test/vendor/jquery-1.10.1.min',
    'jasmine-jquery': '../test/vendor/jasmine-jquery',
    '_': '../test/vendor/lodash.min'
  },

  shim: {
    'jasmine-jquery': {
      deps: ['jquery'],
      exports: 'jasmine-jquery'
    }
  },

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});