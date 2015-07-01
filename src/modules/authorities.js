var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc overview
 * @name authorities
 * @description
 * Functions related to authorities
 *
 * {@link https://familysearch.org/developers/docs/guides/authorities FamilySearch API Docs}
 */

/**
 * @ngdoc function
 * @name authorities.functions:getDate
 * @function
 *
 * @description
 * Get the standardized date
 *
 * - `getDate()` - get the {@link authorities.types:constructor.Date Date} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/dates/Date_resource}
 *
 * {@link http://jsfiddle.net/mL906m82/ editable example}
 *
 * @param {String} date text to standardize
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getDate = function(date, opts) {
  var self = this,
      params = {
        date: date
      };
  return self.plumbing.get(self.helpers.getAPIServerUrl('/platform/dates'), params, {'Accept': 'text/plain'}, opts,
    utils.compose(
      utils.objectExtender({getDate: function() { return utils.maybe(this.date); }}),
      function(body){
        var response = {};
        if(body){
          response.date = self.createDate({
            normalized: body
          });
        }
        return response;
      }
    ));
};

/**
 * @ngdoc function
 * @name authorities.functions:getPlaceSearch
 * @function
 *
 * @description
 * Get the standardized place
 *
 * - `getPlaces()` - get the array of {@link authorities.types:constructor.Place Places} from the response
 *
 * {@link https://familysearch.org/developers/docs/guides/authorities/place-authority FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/1hjbpzgs/ editable example}
 *
 * @param {String} place text to standardize
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPlaceSearch = function(place, opts) {
  var self = this,
      params = {
        place: place,
        view: 'simple',
        dataFormat: 'application/json'
      };
  return self.plumbing.get(self.helpers.getAuthoritiesServerUrl('/authorities/v1/place'), params, {'Accept': 'application/json'}, opts,
    utils.compose(
      utils.objectExtender({getPlaces: function() { return utils.maybe(this.places).place; }}),
      function(response){
        utils.forEach(response.places.place, function(place, index, obj){
          obj[index] = self.createPlace(place);
        });
        return response;
      }
    ));
};

// TODO authorities properties
// TODO name authority
// TODO culture authority
