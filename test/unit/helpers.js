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
  //console.log(filename);
  //console.log(data);
  var headers = {};
  if (data.headers) {
    headers = data.headers;
  }
  var status = 200;
  if (data.status) {
    status = data.status;
  }
  if (data.status >= 300 && data.status < 400){
    opts.url = headers.Location;
    return httpMock(opts, callback);
  }
  
  var returnedData = {};
  
  // Account for non-JSON responses such as the date authority.
  // In those cases we put the response body in the body attribute.
  if(data.body){
    returnedData = data.body;
  }
  
  else {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        if (key !== 'headers' && key !== 'status') {
          returnedData[key] = data[key];
        }
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

// Set this attribute so that the init function
// correctly detects this as the request node lib
httpMock.cookie = 1;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 750;

beforeEach(function() {

  jasmine.addMatchers({
    toEqualJson: function(){
      return {
        compare: function(actual, expected) {
          var result = {};
          // if actual is a string, parse it
          actual = _.isString(actual) ? JSON.parse(actual) : actual;
          // use deep comparison
          result.pass = _.isEqual(actual, expected);
          if(result.pass){
            result.message = 'Equal JSON';
          } else {
            result.message = 'JSON not equal';
          }
          return result;
        }
      };
    }
  });
  
  global.FamilySearch = FamilySearch;
  
  global.FS = new FamilySearch({
    'client_id': 'mock',
    'environment': 'sandbox',
    'http_function': httpMock,
    'deferred_function': q.defer,
    'access_token': 'mock',
    'redirect_uri': 'http://example.com/foo'
  });
  
  global.FS.getHttpRequests = function() {
    return requests;
  };

  requests = []; // reset requests

});
