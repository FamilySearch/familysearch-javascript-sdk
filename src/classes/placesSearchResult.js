var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name places.types:constructor.PlacesSearchResult
 * @description
 *
 * A places search result entry.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var PlacesSearchResult = FS.PlacesSearchResult = function(client, data){ 
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(data.content && data.content.gedcomx && data.content.gedcomx.places){
      var places = data.content.gedcomx.places,
          placesMap = {};
        
      utils.forEach(places, function(place, index, obj){
        if(!(place instanceof FS.PlaceDescription)){
          obj[index] = placesMap[place.id] = client.createPlaceDescription(place);
        }
      });
      
      utils.forEach(places, function(place){
        if(place.data.jurisdiction && place.data.jurisdiction.resource){
          var jurisdictionId = place.data.jurisdiction.resource.substring(1);
          if(placesMap[jurisdictionId]){
            place.setJurisdiction(placesMap[jurisdictionId]);
          }
        }
      });
    }
  }
  
  
};

/**
 * @ngdoc function
 * @name places.functions:createPlacesSearchResult
 * @param {Object} data [Entry](https://familysearch.org/developers/docs/api/atom/Entry_json) data
 * @return {Object} {@link places.types:constructor.PlacesSearchResult PlacesSearchResult}
 * @description Create a {@link places.types:constructor.PlacesSearchResult PlacesSearchResult} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createPlacesSearchResult = function(data){
  return new PlacesSearchResult(this, data);
};

PlacesSearchResult.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  constructor: PlacesSearchResult,
  
  /**
   * @ngdoc function
   * @name places.types:constructor.PlacesSearchResult#getId
   * @methodOf places.types:constructor.PlacesSearchResult
   * @return {string} place id
   */
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlacesSearchResult#getScore
   * @methodOf places.types:constructor.PlacesSearchResult
   * @return {number} higher is better
   */
  getScore: function(){ return this.data.score; },
   
  /**
   * @ngdoc function
   * @name places.types:constructor.PlacesSearchResult#getPlace
   * @methodOf places.types:constructor.PlacesSearchResult
   * @function
   * @return {PlaceDescription} The {@link places.types:constructor.PlaceDescription Place Description}.
   */
  getPlace: function(){
    var maybe = utils.maybe;
    return maybe(maybe(maybe(this.data.content).gedcomx).places)[0];
  }
   
});