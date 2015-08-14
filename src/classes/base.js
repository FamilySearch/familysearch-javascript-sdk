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
};

/**
 * Return JSON string of object data.
 */
FS.BaseClass.prototype.$serialize = function(){
  return JSON.stringify(this, function(key, value){
    if(key.indexOf('$') === 0){
      return;
    }
    return value;
  });
};

/**
 * Return a promise for the specified link object, if it exists.
 * This isn't an asynchronous operation but we use promises anyway
 * so that API methods can easily return this when rejected.
 */
FS.BaseClass.prototype.$getLink = function(name){
  var d = this.$client.settings.deferredWrapper();
  if(this.links && this.links[name]){
    d.resolve(this.links[name]);
  } else {
    d.reject(new Error('Missing link: ' + name));
  }
  return d.promise;
};