// separate karma.conf.js file for use with WebStorm
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'requirejs'],
    files: [
      {pattern: 'test/vendor/*.js', included: false},
      {pattern: 'test/mock/*.json', watched: true, served: true, included: false},
      {pattern: 'src/*.js', included: false},
      {pattern: 'test/unit/helpers.js', included: false},
      {pattern: 'test/unit/*Spec.js', included: false},
      'test/unit/test-main.js'
    ],
    browsers: ['Firefox']
  });
};

