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

PlaceDescription.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  constructor: PlaceDescription,
  
  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceDescription#id
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {string} place id
   */
  
  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceDescription#names
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {TextValue[]} An array of names. The preferred value is first.
   */
  
  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceDescription#lang
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {string} The language of the Place Description. See [http://www.w3.org/International/articles/language-tags/](http://www.w3.org/International/articles/language-tags/)
   */

  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceDescription#identifiers
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {Object} map of identifiers to arrays of values
   */
  
  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceDescription#type
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {string} A URI used to identify the type of a place.
   */
  
  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceDescription#latitude
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {number} Degrees north or south of the Equator (0.0 degrees). Values range from −90.0 degrees (south) to 90.0 degrees (north).
   */
  
  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceDescription#longitude
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {number} Angular distance in degrees, relative to the Prime Meridian. Values range from −180.0 degrees (west of the Meridian) to 180.0 degrees (east of the Meridian).
   */
  
  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceDescription#temporalDescription
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {Object} A description of the time period to which this place description is relevant.
   */

  /**
   * @ngdoc property
   * @name places.types:constructor.PlaceDescription#display
   * @propertyOf places.types:constructor.PlaceDescription
   * @return {Object} includes `name`, `fullName`, and `type` attributes
   */
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#$getName
   * @methodOf places.types:constructor.PlaceDescription
   * @function
   * @return {String} The name of this place as listed in the display properties.
   */
  $getName: function(){
    return utils.maybe(this.display).name;
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#$getFullName
   * @methodOf places.types:constructor.PlaceDescription
   * @function
   * @return {String} The fully qualified name (e.g. includes the name of parent jursdictions) of this place as listed in the display properties
   */
  $getFullName: function(){
    return utils.maybe(this.display).fullName;
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#$getType
   * @methodOf places.types:constructor.PlaceDescription
   * @function
   * @return {String} The type as listed in the display properties.
   */
  $getType: function(){
    return utils.maybe(this.display).type;
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#$getPlaceDescriptionUrl
   * @methodOf places.types:constructor.PlaceDescription
   * @function
   * @return {String} The place description's url without the access token
   */
  $getPlaceDescriptionUrl: function(){
    return this.$helpers.removeAccessToken(utils.maybe(utils.maybe(this.links).description).href);
  },
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#$getJurisdictionSummary
   * @methodOf places.types:constructor.PlaceDescription
   * @function
   * @description Get a summary of the jurisdiction's place description, when available. Useful
   * for place descriptions returned by {@link places.functions:getPlaceDescription} if you just
   * want the names and ids of all place descriptions in the jurisdiction chain. If you want
   * more details then use {@link places.types:constructor.PlaceDescription#$getJurisdictionDetails}.
   * @return {PlaceDescription} A summary PlaceDescription for this PlaceDescription's jurisdiction.
   */
  $getJurisdictionSummary: function() {
    if(this.jurisdiction instanceof FS.PlaceDescription){
      return this.jurisdiction;
    }
  },
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#$getJurisdictionDetails
   * @methodOf places.types:constructor.PlaceDescription
   * @function
   * @description Get the full details of the jurisdiction's PlaceDescription. The promise
   * will fail if no jurisdiction is available.
   * @return {Object} A promise for the response of retrieving the details for the jursdiction
   */
  $getJurisdictionDetails: function() {
    if(this.jurisdiction instanceof FS.PlaceDescription){
      return this.$client.getPlaceDescription(this.jurisdiction.$getPlaceDescriptionUrl());
    } else {
      var d = this.$client.settings.deferredWrapper(),
          promise = d.promise;
      d.reject(new Error('No jurisdiction available'));
      return promise;
    }
  },
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlaceDescription#$setJurisdiction
   * @methodOf places.types:constructor.PlaceDescription
   * @function
   * @param {Object} A json object representing the new jursidication data, or a PlaceDescription object.
   */
  $setJurisdiction: function(jurisdiction){
    if(!(jurisdiction instanceof FS.PlaceDescription)){
      jurisdiction = this.client.createPlaceDescription(jurisdiction);
    }
    this.jurisdiction = jurisdiction;
  }

});