var FamilySearch = require('../../src/FamilySearch'),
    _ = require('lodash'),
    fs = require('fs'),
    q = require('q');

// not the same as src/helpers/decodeQueryString
function decodeQueryString(qs) {
  var obj = {};
  var queryPos = qs.indexOf('?');
  if (queryPos !== -1) {
    var segments = qs.substring(queryPos+1).split('&');
    for (var i = 0, len = segments.length; i < len; i++) {
      var kv = segments[i].split('=', 2);
      if (kv && kv[0]) {
        var key = decodeURIComponent(kv[0]);
        var value = decodeURIComponent(kv[1]);
        obj[key] = obj[key] ? obj[key] + '_' + value : value; // quick hack to encode multiple values into a unique string
      }
    }
  }
  return obj;
}

function keys(obj) {
  var result = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      result.push(prop);
    }
  }
  return result;
}

function isEmpty(obj) {
  return keys(obj).length === 0;
}

function getFilename(opts) {
  var params = decodeQueryString(opts.url);
  var filename = opts.url.replace(/[^\/]*\/\/[^\/]+\//, '').replace(/\?.*$/, ''); // get path portion of URL
  if (opts.method !== 'GET') {
    filename = opts.method.toLowerCase() + '_' + filename;
  }
  var sortedKeys = keys(params).sort(); // sort parameters in alphabetical order
  for (var i = 0, len = sortedKeys.length; i < len; i++) {
    var key = sortedKeys[i];
    if (key !== 'access_token') { // skip access token
      filename = filename + '_' + encodeURIComponent(sortedKeys[i]) + '_' + encodeURIComponent(params[sortedKeys[i]]);
    }
  }
  return filename.replace(/[^A-Za-z0-9_-]/g, '_') + '.json'; // convert special characters to _'s
}

function loadFile(filename){
  var contents = {};
  try {
    contents = JSON.parse(fs.readFileSync(__dirname + '/../mock/' + filename));
  } catch (e) { }
  return contents;
}

// Track requests that have been made

var requests = [];

FamilySearch.getHttpRequests = function() {
  return requests;
};

/**
 * Mock an http call, fetching the json from a file in test/mock
 *
 * @param opts
 * @returns {Object} promise
 */
function httpMock(opts, callback) {
  requests.push(opts);
  var filename = getFilename(opts);
  var data = loadFile(filename);
  var headers = {};
  if (data.headers) {
    headers = data.headers;
  }
  var status = 200;
  if (data.status) {
    status = data.status;
  }
  var returnedData = {};
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      if (key !== 'headers' && key !== 'status') {
        returnedData[key] = data[key];
      }
    }
  }
  if (opts.method === 'POST' && isEmpty(returnedData)) {
    returnedData = null;
  }

  setTimeout(function(){
    callback(null, {
      headers: headers,
      statusCode: status
    }, returnedData);
  });
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 750;

beforeEach(function() {

  jasmine.addMatchers({
    toEqualJson: function(expected) {
      // if actual is a string, parse it
      var actual = _.isString(this.actual) ? JSON.parse(this.actual) : this.actual;
      // use deep comparison
      return _.isEqual(actual, expected);
    }
  });

  global.FS = new FamilySearch({
    'client_id': 'mock',
    'environment': 'sandbox',
    'redirect_uri': 'mock',
    'http_function': httpMock,
    'deferred_function': q.defer,
    'access_token': 'mock'
  });

  requests = []; // reset requests

});
