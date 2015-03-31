var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * Create a base class constructor which all other class
 * constructors will call. The purpose is to share
 * a few common lines of init code.
 */
FS.BaseClass = function(client, data){
  
  // This call to extend is intentionally the first line.
  // This prevents us from accidentally overriding one of
  // the three necessary attributes for interacting with
  // the SDK.
  if(utils.isObject(data)){
    utils.extend(this, data);
  }
  
  // Make the client accessible to class methods. Use the
  // $ prefix to avoid potential conflicts with data.
  // $helpers and $plumbing are just shortcuts.
  this.$client = client;
  this.$helpers = client.helpers;
  this.$plumbing = client.plumbing;
  
  /*
  this.toJSON = function(){
    var obj = {};
    for(var a in this){
      if(a.indexOf('$') !== 0){
        obj[a] = this[a];
      }
    }
    return obj;
  };
  */
  
  this.toJSON = function(){
    _toJSON(this, true);
  };
};

/**
 * Recursively serialize objects. Ignore properties that being with '$'.
 * 
 * If an object already has a toJSON method specified then call that instead.
 * This allows us to use this same recursive method on all SDK objects with
 * properties that may or may not be SDK objects with the toJSON method.
 */
function _toJSON(obj, self){
  if(!self && obj.toJSON && utils.isFunction(obj.toJSON)){
    return obj.toJSON();
  } else {
    var data = {};
    for(var a in obj){
      if(a.indexOf('$') !== 0){
        if(utils.isObject(obj[a])){
          data[a] = _toJSON(obj[a]);
        } else {
          data[a] = obj[a];
        }
      }
    }
    console.log(data);
    return data;
  }
}