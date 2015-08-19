var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass
 * @description
 * 
 * Base class constructor which all other classes inherit from.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
FS.BaseClass = function(client, data){
  
  if(data){
    this.data = data;
  } else {
    this.data = {};
  }
  
  // Make the client accessible to class methods.
  // helpers and plumbing are just shortcuts.
  this.client = client;
  this.helpers = client.helpers;
  this.plumbing = client.plumbing;
  
  if(this.data.attribution && !(this.data.attribution instanceof FS.Attribution)){
    this.setAttribution(this.data.attribution);
  }
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#getId
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {String} Id of the agent
 */
FS.BaseClass.prototype.getId = function(){
  return this.data.id;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#setId
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {string} id new id
 * @return {Object} this object
 */
FS.BaseClass.prototype.setId = function(id){
  this.data.id = id;
  return this;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#getLinks
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {Object} links
 */
FS.BaseClass.prototype.getLinks = function(){
  if(!this.data.links){
    // We don't create the links object in this case because it will show
    // up as an empty object during serialization. There might be a better
    // way, such as filter empty objects during serialization, but I'd rather
    // not mess with that risky behavior right now.
    return {};
  } else {
    return this.data.links;
  }
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#getLink
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {string} rel link rel
 * @return {Object} link
 */
FS.BaseClass.prototype.getLink = function(rel){
  if(this.data.links && this.data.links[rel]){
    return this.data.links[rel];
  }
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#getLinkPromise
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {Object} promise for the link
 */
FS.BaseClass.prototype.getLinkPromise = function(name){
  var d = this.client.settings.deferredWrapper(),
      links = this.getLinks();
  if(links[name]){
    d.resolve(links[name]);
  } else {
    d.reject(new Error('Missing link: ' + name));
  }
  return d.promise;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#addLink
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {string} rel link rel
 * @param {object} link link object
 * @return {Object} this object
 */
FS.BaseClass.prototype.addLink = function(rel, link){
  if(!this.data.links){
    this.data.links = {};
  }
  this.data.links[rel] = link;
  return this;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#addLinks
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {object} links links object
 * @return {Object} this object
 */
FS.BaseClass.prototype.addLinks = function(links){
  var self = this;
  utils.forEach(links, function(link, rel){
    self.addLink(rel, link);
  });
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#setAttribution
 * @methodOf familysearch.types:constructor.BaseClass
 * @param {object|string} attribution Attribution object or change message string
 * @return {Object} this object
 */
FS.BaseClass.prototype.setAttribution = function(attribution){
  if(attribution){
    if(!(attribution instanceof FS.Attribution)){
      attribution = this.client.createAttribution(attribution);
    }
    this.data.attribution = attribution;
  }
  return this;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#getAttribution
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {Object} Attribution
 */
FS.BaseClass.prototype.getAttribution = function(){
  return this.data.attribution;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#toJSON
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {Object} JSON object that JSON.stringify() will use
 */
FS.BaseClass.prototype.toJSON = function(){
  return this.data;
};

/**
 * @ngdoc function
 * @name familysearch.types:constructor.BaseClass#toString
 * @methodOf familysearch.types:constructor.BaseClass
 * @return {string} serialized form of the object
 */
FS.BaseClass.prototype.toString = function(){
  return JSON.stringify(this.data);
};

/**
 * This tells the console to use the toString method,
 * otherwise it will print lots of stuff we don't care about
 */
FS.BaseClass.prototype.inspect = function(){
  return this.toString();  
};