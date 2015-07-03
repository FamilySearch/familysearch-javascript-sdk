var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.PlaceDescription
 * @description
 *
 * Place description returned by the Place Authority.
 */
var PlaceDescription = FS.PlaceDescription = function(client, data){ 
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(data.names){
      utils.forEach(this.names, function(name, i){
        if(!(name instanceof FS.TextValue)){
          this.names[i] = client.createTextValue(name);
        }
        this.names[i] = client.createTextValue(name);
      }, this);
    }
  }
};

/**
 * @ngdoc function
 * @name places.functions:createPlaceDescription
 * @param {Object} data [PlaceDescription](https://familysearch.org/developers/docs/api/gx/PlaceDescription_json) data
 * @return {Object} {@link places.types:constructor.PlaceDescription PlaceDescription}
 * @description Create a {@link places.types:constructor.PlaceDescription PlaceDescription} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPlaceDescription = function(data){
  return new PlaceDescription(this, data);
};

PlaceDescription.prototype = {
  constructor: PlaceDescription
  
  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceDescription#id
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {string} place id
   */
  
  /**
   * @ngdoc names
   * @name places.types:constructor.PlaceDescription#names
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {TextValue[]} An array of names. The preferred value is first.
   */
   
};