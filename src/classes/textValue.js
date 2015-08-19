var FS = require('./../FamilySearch'),
    utils = require('../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.TextValue
 * @description
 *
 * Place description returned by the Place Authority.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
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

TextValue.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: TextValue,
  
  /**
   * @ngdoc function
   * @name places.types:constructor.TextValue#getLang
   * @methodOf places.types:constructor.TextValue
   * @return {string} The language of the text value. See [http://www.w3.org/International/articles/language-tags/](http://www.w3.org/International/articles/language-tags/)
   */
  getLang: function(){ return this.data.lang; },
   
  /**
   * @ngdoc function
   * @name places.types:constructor.TextValue#getValue
   * @methodOf places.types:constructor.TextValue
   * @return {string} The text value.
   */ 
  getValue: function(){ return this.data.value; }
});