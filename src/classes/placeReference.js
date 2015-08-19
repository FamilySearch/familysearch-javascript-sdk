var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.PlaceReference
 * @description
 *
 * Place reference as used in Facts.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var PlaceReference = FS.PlaceReference = function(client, data){ 
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(utils.isString(data.normalized)){
      this.setNormalized(data.normalized);
    }
  }
};

/**
 * @ngdoc function
 * @name places.functions:createPlaceReference
 * @param {Object} data [PlaceReference](https://familysearch.org/developers/docs/api/gx/PlaceReference_json) data
 * @return {Object} {@link places.types:constructor.PlaceReference PlaceReference}
 * @description Create a {@link places.types:constructor.PlaceReference PlaceReference} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPlaceReference = function(data){
  return new PlaceReference(this, data);
};

PlaceReference.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: PlaceReference,
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceReference#getOriginal
   * @methodOf places.types:constructor.PlaceReference
   * @return {string} The original place value.
   */
  getOriginal: function(){ return this.data.original; },
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceReference#getNormalized
   * @methodOf places.types:constructor.PlaceReference
   * @return {string} The normalized place value.
   */
  getNormalized: function(){ return utils.maybe(utils.maybe(this.data.normalized)[0]).value; },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceReference#setOriginal
   * @methodOf places.types:constructor.PlaceReference
   * @param {string} original original place value
   * @return {PlaceReference} this PlaceReference
   */
  setOriginal: function(original){
    this.data.original = original;
    return this;
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceReference#setOriginal
   * @methodOf places.types:constructor.PlaceReference
   * @param {string} normalized normalized place value
   * @return {PlaceReference} this PlaceReference
   */
  setNormalized: function(normalized){
    this.data.normalized = [{
      value: normalized
    }];
    return this;
  }
  
});