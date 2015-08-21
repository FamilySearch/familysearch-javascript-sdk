var FamilySearch = require('../../src/FamilySearch'),
    mitm = require('mitm')(),
    _ = require('lodash'),
    fs = require('fs');

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

function getFilename(req) {
  var params = decodeQueryString(req.url);
  var filename = req.url.replace(/\?.*$/, ''); // remove query params
  if (req.method !== 'GET') {
    filename = req.method.toLowerCase() + filename;
  }
  var sortedKeys = keys(params).sort(); // sort parameters in alphabetical order
  for (var i = 0, len = sortedKeys.length; i < len; i++) {
    var key = sortedKeys[i];
    if (key !== 'access_token') { // skip access token
      filename = filename + '_' + encodeURIComponent(sortedKeys[i]) + '_' + encodeURIComponent(params[sortedKeys[i]]);
    }
  }
  // convert special characters to _'s and remove a possible leading _
  return filename.replace(/[^A-Za-z0-9_-]/g, '_').replace(/^_/, '') + '.json';
}

function loadFile(filename){
  var contents = {};
  try {
    contents = JSON.parse(fs.readFileSync(__dirname + '/../mock/' + filename));
  } catch (e) { 
    // console.error('unable to load mock file: %s', filename);
  }
  return contents;
}

/**
 * Mock an http call, fetching the json from a file in test/mock
 *
 * @param opts
 * @returns {Object} promise
 */
function httpMock(req, res) {
  var filename = getFilename(req);
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
    req.url = headers.Location;
    httpMock(req, res);
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
  
  if (req.method === 'POST' && isEmpty(returnedData)) {
    returnedData = null;
  }
  
  res.statusCode = status;
  for(var name in headers){
    if(headers.hasOwnProperty(name)){
      res.setHeader(name, headers[name]);
    }
  }
  if(returnedData){
    res.write(JSON.stringify(returnedData));
  }
  res.end();
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 750;

mitm.on('request', httpMock);

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
    'access_token': 'mock',
    'redirect_uri': 'http://example.com/foo'
  });

});
