var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name places
 * @description
 * Functions for interacting with the FamilySearch Place Authority
 *
 * {@link https://familysearch.org/developers/docs/guides/authorities FamilySearch API Docs}
 */
 
/**
 * @ngdoc function
 * @name places.functions:getPlace
 * @function
 *
 * @description
 * Get a place.
 *
 * - `getPlace()` - get the {@link authorities.types:constructor.Date Date} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/dates/Date_resource}
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
      utils.objectExtender({getPlace: function() { return utils.maybe(this.places)[0]; }}),
      function(response){
        utils.forEach(response.places, function(place, index, obj){
          obj[index] = self.createPlaceDescription(place);
        });
        return response;
      }
    ));
};