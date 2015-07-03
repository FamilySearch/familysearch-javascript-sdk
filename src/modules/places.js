var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name places
 * @description
 * Functions for interacting with the FamilySearch Place Authority
 *
 * {@link https://familysearch.org/developers/docs/api/resources#places FamilySearch API Docs}
 */
 
/**
 * @ngdoc function
 * @name places.functions:getPlace
 * @function
 *
 * @description
 * Get a place.
 *
 * - `getPlace()` - get the {@link places.types:constructor.PlaceDescription PlaceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_resource}
 *
 * @param {String} id of the place
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPlace = function(placeId, opts) {
  var self = this,
      url = self.helpers.getAPIServerUrl(self.helpers.populateUriTemplate('/platform/places/{id}', {id: placeId}));
  return self.plumbing.get(url, {}, {}, opts,
    utils.compose(
      utils.objectExtender({
        getPlace: function() { 
          return utils.maybe(this.places)[0]; 
        }
      }),
      function(response){
        utils.forEach(response.places, function(place, index, obj){
          obj[index] = self.createPlaceDescription(place);
        });
        return response;
      }
    ));
};

/**
 * @ngdoc function
 * @name places.functions:getPlaceDescription
 * @function
 *
 * @description
 * Get a place.
 *
 * - `getPlaceDescription()` - get the {@link places.types:constructor.PlaceDescription PlaceDescription} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/places/Place_Description_resource}
 *
 * @param {String} id of the place description
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceDescription = function(placeId, opts) {
  var self = this,
      url = self.helpers.getAPIServerUrl(self.helpers.populateUriTemplate('/platform/places/description/{id}', {id: placeId}));
  return self.plumbing.get(url, {}, {}, opts,
    utils.compose(
      utils.objectExtender({
        getPlaceDescription: function() { 
          return utils.maybe(this.places)[0]; 
        }
      }),
      function(response){
        var placesMap = {};
        
        utils.forEach(response.places, function(place, index, obj){
          obj[index] = placesMap[place.id] = self.createPlaceDescription(place);
        });
        utils.forEach(response.places, function(place){
          if(place.jurisdiction && place.jurisdiction.resource){
            var jurisdictionId = place.jurisdiction.resource.substring(1);
            if(placesMap[jurisdictionId]){
              place.$setJurisdiction(placesMap[jurisdictionId]);
            }
          }
        });
        
        return response;
      }
    ));
};