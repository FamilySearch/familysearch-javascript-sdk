var FS = require('./../FamilySearch');

/**
 * @ngdoc function
 * @name places.types:constructor.TextValue
 * @description
 *
 * Place description returned by the Place Authority.
 */
var TextValue = FS.TextValue = function(client, data){ 
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name places.functions:createTextValue
 * @param {Object} data [PlaceDescription](https://familysearch.org/developers/docs/api/gx/TextValue_json) data
 * @return {Object} {@link places.types:constructor.TextValue TextValue}
 * @description Create a {@link places.types:constructor.TextValue TextValue} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createTextValue = function(data){
  return new TextValue(this, data);
};

TextValue.prototype = {
  constructor: TextValue
  
  /**
   * @ngdoc property
   * @name places.types:constructor.TextValue#lang
   * @propertyOf places.types:constructor.TextValue
   * @return {string} The language of the text value. See [http://www.w3.org/International/articles/language-tags/](http://www.w3.org/International/articles/language-tags/)
   */
   
  /**
   * @ngdoc property
   * @name places.types:constructor.TextValue#value
   * @propertyOf places.types:constructor.TextValue
   * @return {string} The text value.
   */ 
};