// separate karma.conf.js file for use with WebStorm
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'familysearch-javascript-sdk.js',
      'test/vendor/jquery-1.10.1.min.js',
      'test/vendor/jasmine-jquery.js',
      {pattern: 'test/mock/*.json', watched: true, served: true, included: false},
      'test/unit/*.js'
    ],
    browsers: ['Firefox']
  });
};

