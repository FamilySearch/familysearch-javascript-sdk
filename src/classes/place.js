var FS = require('./../FamilySearch');

/**
 * @ngdoc function
 * @name authorities.types:constructor.Place
 * @description
 *
 * Standardized place
 */
var Place = FS.Place = function(client, data){ 
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name authorities.functions:createPlace
 * @param {Object} data [PlaceReference](https://familysearch.org/developers/docs/api/gx/PlaceReference_json) data
 * @return {Object} {@link authorities.types:constructor.Place Place}
 * @description Create a {@link authorities.types:constructor.Place Place} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPlace = function(data){
  return new Place(this, data);
};

Place.prototype = {
  constructor: Place,

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#official
   * @propertyOf authorities.types:constructor.Place
   * @return {string} normalized place name; e.g., Minnesota
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#normalized
   * @propertyOf authorities.types:constructor.Place
   * @return {string[]} array of fully-normalized place names; e.g., ["Minnesota, United States"]
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#original
   * @propertyOf authorities.types:constructor.Place
   * @return {string} original place to standardize
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#id
   * @propertyOf authorities.types:constructor.Place
   * @return {string} place id
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#requestedId
   * @propertyOf authorities.types:constructor.Place
   * @return {string} no idea
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#type
   * @propertyOf authorities.types:constructor.Place
   * @return {string} type of the place; e.g., First-Order Administrative Division
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#culture
   * @propertyOf authorities.types:constructor.Place
   * @return {string} id of the culture
   */

  /**
   * @ngdoc property
   * @name authorities.types:constructor.Place#iso
   * @propertyOf authorities.types:constructor.Place
   * @return {string} ISO place id; e.g., US-MN
   */

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date#$getNormalizedPlace
   * @methodOf authorities.types:constructor.Place
   * @function
   * @return {string} convenience function to return the first element of the normalized array
   */
  $getNormalizedPlace: function() {
    return this.normalized ? this.normalized[0] : undefined;
  }
};