var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.PlacesSearchResult
 * @description
 *
 * A places search result entry.
 */
var PlacesSearchResult = FS.PlacesSearchResult = function(client, data){ 
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(data.content && data.content.gedcomx && data.content.gedcomx.places){
      var places = data.content.gedcomx.places,
          placesMap = {};
        
      utils.forEach(places, function(place, index, obj){
        obj[index] = placesMap[place.id] = client.createPlaceDescription(place);
      });
      
      utils.forEach(places, function(place){
        if(place.jurisdiction && place.jurisdiction.resource){
          var jurisdictionId = place.jurisdiction.resource.substring(1);
          if(placesMap[jurisdictionId]){
            place.$setJurisdiction(placesMap[jurisdictionId]);
          }
        }
      });
    }
  }
  
  
};

/**
 * @ngdoc function
 * @name places.functions:createPlaceDescription
 * @param {Object} data [Entry](https://familysearch.org/developers/docs/api/atom/Entry_json) data
 * @return {Object} {@link places.types:constructor.PlacesSearchResult PlacesSearchResult}
 * @description Create a {@link places.types:constructor.PlacesSearchResult PlacesSearchResult} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPlacesSearchResult = function(data){
  return new PlacesSearchResult(this, data);
};

PlacesSearchResult.prototype = {
  constructor: PlacesSearchResult,
  
  /**
   * @ngdoc property
   * @name places.types:constructor.PlacesSearchResult#id
   * @propertyOf places.types:constructor.PlacesSearchResult
   * @return {string} place id
   */
   
  /**
   * @ngdoc property
   * @name places.types:constructor.PlacesSearchResult#score
   * @propertyOf places.types:constructor.PlacesSearchResult
   * @return {number} higher is better
   */
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlacesSearchResult#$getPlace
   * @methodOf places.types:constructor.PlacesSearchResult
   * @function
   * @return {PlaceDescription} The {@link places.types:constructor.PlaceDescription Place Description}.
   */
  $getPlace: function(){
    var maybe = utils.maybe;
    return maybe(maybe(maybe(this.content).gedcomx).places)[0];
  }
   
};