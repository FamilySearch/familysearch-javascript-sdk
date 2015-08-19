var FS = require('./../FamilySearch'),
    utils = require('../utils');

/**
 * @ngdoc function
 * @name authorities.types:constructor.Date
 * @description
 *
 * Date
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var FSDate = FS.Date = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(utils.isString(data.normalized)){
      this.setNormalized(data.normalized);
    }
  }
};

/**
 * @ngdoc function
 * @name authorities.functions:createDate
 * @param {Object} data [Date](https://familysearch.org/developers/docs/api/gx/Date_json) data
 * @return {Object} {@link authorities.types:constructor.Date Date}
 * @description Create a {@link authorities.types:constructor.Date Date} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createDate = function(data){
  return new FSDate(this, data);
};

FSDate.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: FSDate,

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#getOriginal
   * @methodOf authorities.types:constructor.Date
   * @return {string} original date string
   */
  getOriginal: function(){
    return this.data.original;
  },
   
  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#getFormal
   * @methodOf authorities.types:constructor.Date
   * @return {string} formal date string
   */
  getFormal: function(){
    return this.data.formal;
  },
  
  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#getNormalized
   * @methodOf authorities.types:constructor.Date
   * @return {string} normalized date string
   */
  getNormalized: function(){
    // Return the first because, for now, FS only ever returns one
    return utils.maybe(utils.maybe(this.data.normalized)[0]).value;
  },

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#setOriginal
   * @methodOf authorities.types:constructor.Date
   * @param {string} original Original date
   * @return {Date} Date object
   */
  setOriginal: function(original){
    this.data.original = original;
    return this;
  },
   
  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#setFormal
   * @methodOf authorities.types:constructor.Date
   * @param {string} formal Formal date
   * @return {Date} Date object
   */
  setFormal: function(formal){
    this.data.formal = formal;
    return this;
  },
  
  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#setNormalized
   * @methodOf authorities.types:constructor.Date
   * @param {string} normalized Normalized date
   * @return {Date} Date object
   */
  setNormalized: function(normalized){
    // Always set the first because, for now, FS only ever uses one
    this.data.normalized = [ { value: normalized } ];
    return this;
  }
  
});
