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
 * @return {Object} promise for the response
 */
FS.prototype.getDate = function(date) {
  var self = this;
  return self.plumbing.getCollectionUrl('FSDA', 'normalized-date').then(function(url){
    return self.plumbing.get(url, {date: date}, {'Accept': 'text/plain'});
  }).then(function(response){
    var date;
    if(response.getData()){
      date = self.createDate({
        normalized: response.getData(),
        formal: response.getHeader('Location').split(':')[1]
      });
    }
    response.getDate = function() { 
      return utils.maybe(date);
    };
    return response;
  });
};
