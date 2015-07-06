var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.PlaceType
 * @description
 *
 * Type of place, such as a cemetery, city, state, etc.
 */
var PlaceType = FS.PlaceType = function(client, data){ 
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name places.functions:createPlaceType
 * @param {Object} data
 * @return {Object} {@link places.types:constructor.PlaceType PlaceType}
 * @description Create a {@link places.types:constructor.PlaceType PlaceType} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPlaceType = function(data){
  return new PlaceType(this, data);
};

PlaceType.prototype = {
  constructor: PlaceType,
  
  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceType#id
   * @propertyOf places.types:constructor.PlaceType
   * @return {string} place id
   */
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceType#$getLabel
   * @methodOf places.types:constructor.PlaceType
   * @function
   * @return {String} The label of this place type.
   */
  $getLabel: function(){
    return utils.maybe(utils.maybe(this.labels)[0])['@value'];
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceType#$getDescription
   * @methodOf places.types:constructor.PlaceType
   * @function
   * @return {String} The label of this place type.
   */
  $getDescription: function(){
    return utils.maybe(utils.maybe(this.descriptions)[0])['@value'];
  }
   
};