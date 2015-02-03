/**
 * @ngdoc overview
 * @name authorities
 * @description
 * Functions related to authorities
 *
 * {@link https://familysearch.org/developers/docs/guides/authorities FamilySearch API Docs}
 */

var Authorities = function(client){
  this.maybe = client.helpers.maybe;
  this.helpers = client.helpers;
  this.plumbing = client.plumbing;
};

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
 * {@link https://familysearch.org/developers/docs/guides/authorities/date-authority FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/DallanQ/4ab5M/ editable example}
 *
 * @param {String} date text to standardize
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
Authorities.prototype.getDate = function(date, opts) {
  var self = this,
      params = {
        date: date,
        dataFormat: 'application/json'
      };
  return self.plumbing.get(self.helpers.getAuthoritiesServerUrl('/authorities/v1/date'), params, {'Accept': 'application/json'}, opts,
    self.helpers.compose(
      self.helpers.objectExtender({getDate: function() { return self.maybe(self.maybe(this.dates).date)[0]; }}),
      self.helpers.constructorSetter(Date, 'date', function(response) {
        return response.dates;
      })
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
 * {@link http://jsfiddle.net/DallanQ/xrsAQ/ editable example}
 *
 * @param {String} place text to standardize
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
Authorities.prototype.getPlaceSearch = function(place, opts) {
  var self = this,
      params = {
        place: place,
        view: 'simple',
        dataFormat: 'application/json'
      };
  return self.plumbing.get(self.helpers.getAuthoritiesServerUrl('/authorities/v1/place'), params, {'Accept': 'application/json'}, opts,
    self.helpers.compose(
      self.helpers.objectExtender({getPlaces: function() { return self.maybe(this.places).place; }}),
      self.helpers.constructorSetter(Place, 'place', function(response) {
        return response.places;
      })
    ));
};

// TODO authorities properties
// TODO name authority
// TODO culture authority

return Authorities;
