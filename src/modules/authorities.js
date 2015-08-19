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
 * {@link https://familysearch.org/developers/docs/api/dates/Date_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/mL906m82/2/ Editable Example}
 *
 * @param {String} date text to standardize
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getDate = function(date, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getCollectionUrl('FSDA', 'normalized-date'),
    function(url){
      var promise = self.plumbing.get(url, {date: date}, {'Accept': 'text/plain'}, opts,
        utils.compose(
          utils.objectExtender({getDate: function() { return utils.maybe(this.date); }}),
          function(body){
            var response = {};
            if(body){
              response.date = self.createDate({
                normalized: body,
                formal: promise.getResponseHeader('Location').split(':')[1]
              });
            }
            return response;
          }
        )
      );
      return promise;
    });
};
