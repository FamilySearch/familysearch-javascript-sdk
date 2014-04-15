define([
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name authorities
   * @description
   * Functions related to authorities
   *
   * {@link https://familysearch.org/developers/docs/guides/authorities FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Date
   * @description
   *
   * Standardized date
   */
  var Date = exports.Date = function() {

  };

  // construct formal date from [about|after|before] [[day] month] year [BC]
  // export for unit testing
  var constructFormalDate = exports.constructFormalDate = function(fields, ignoreModifiers) {
    var prefix = '', suffix = '', day = '', month = '', year, sign = '+';
    var pos = 0;
    // handle modifier
    if (fields[pos] === 'about') {
      if (!ignoreModifiers) {
        prefix = 'A';
      }
      pos++;
    }
    else if (fields[pos] === 'before') {
      if (!ignoreModifiers) {
        prefix = 'A/';
      }
      pos++;
    }
    else if (fields[pos] === 'after') {
      if (!ignoreModifiers) {
        prefix = 'A';
        suffix = '/';
      }
      pos++;
    }
    // handle day (no month names are <= 2 characters)
    if (fields[pos].length <= 2) {
      day = (fields[pos].length === 1 ? '0' : '') + fields[pos];
      pos++;
    }
    // handle month
    var monthNum = ['january','february','march','april','may','june','july','august','september','october','november','december']
      .indexOf(fields[pos]) + 1;
    if (monthNum > 0) {
      month = (monthNum < 10 ? '0' : '') + monthNum.toString();
      pos++;
    }
    // handle year (required)
    year = fields[pos];
    pos++;
    // handle bc
    if (pos < fields.length && fields[pos] === 'bc') {
      sign = '-';
    }
    // construct formal date
    return prefix+sign+year+(month ? '-' : '')+month+(day ? '-' : '')+day+suffix;
  };

  exports.Date.prototype = {
    constructor: Date,

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#normalized
     * @propertyOf authorities.types:constructor.Date
     * @return {string} normalized date
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#earliest
     * @propertyOf authorities.types:constructor.Date
     * @return {Object} information (normalized, numeric, astro) about earliest date in a range
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#latest
     * @propertyOf authorities.types:constructor.Date
     * @return {Object} information (normalized, numeric, astro) about latest date in a range
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#requested
     * @propertyOf authorities.types:constructor.Date
     * @return {string} requested date to standardize
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#original
     * @propertyOf authorities.types:constructor.Date
     * @return {string} original date to standardize
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#ambiguous
     * @propertyOf authorities.types:constructor.Date
     * @return {boolean} true if ambiguous
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Date#valid
     * @propertyOf authorities.types:constructor.Date
     * @return {boolean} true if valid
     */

    /**
     * @ngdoc function
     * @name authorities.types:constructor.Date#$getFormalDate
     * @methodOf authorities.types:constructor.Date
     * @function
     * @return {string} GEDCOM-X formal date format
     */
    $getFormalDate: function() {
      // as far as I can tell, normalized date appears in one of three formats:
      // [about|after|before] [[day] month] year [BC]
      // from [[day] month] year [BC] to [[day] month] year [BC]
      // [[day] month] year [BC] (/ [[day] month] year [BC])+
      var formalDate = '';
      if (this.normalized) {
        // split into fields
        var fields = this.normalized.trim().toLowerCase().split(' ');
        // GEDCOM-X formal date doesn't allow the third format, so keep just the first date
        var pos = fields.indexOf('/');
        if (pos >= 0) {
          fields = fields.slice(0, pos);
        }
        // handle from <date> to <date>
        if (fields[0] === 'from') {
          pos = fields.indexOf('to');
          // date normalization has a bug where "before 20 Mar 2006 - after 16 dec 2007"
          // is normalized to "from after 20 March 2006 to 16 December 2007"
          // to get around this bug, ignore date modifiers when parsing date-range dates so we return simply "+2006-03-20/+2007-12-16"
          formalDate = constructFormalDate(fields.slice(1,pos), true)+'/'+constructFormalDate(fields.slice(pos+1), true);
        }
        else {
          // handle <date>
          formalDate = constructFormalDate(fields, false);
        }
      }
      return formalDate;
    }
  };

  /**
   * @ngdoc function
   * @name authorities.types:constructor.Place
   * @description
   *
   * Standardized place
   */
  var Place = exports.Place = function() {

  };

  exports.Place.prototype = {
    constructor: Place,

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#official
     * @propertyOf authorities.types:constructor.Place
     * @return {string} normalized place name; e.g., Minnesota
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#normalized
     * @propertyOf authorities.types:constructor.Place
     * @return {string[]} array of fully-normalized place names; e.g., ["Minnesota, United States"]
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#original
     * @propertyOf authorities.types:constructor.Place
     * @return {string} original place to standardize
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#id
     * @propertyOf authorities.types:constructor.Place
     * @return {string} place id
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#requestedId
     * @propertyOf authorities.types:constructor.Place
     * @return {string} no idea
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#type
     * @propertyOf authorities.types:constructor.Place
     * @return {string} type of the place; e.g., First-Order Administrative Division
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#culture
     * @propertyOf authorities.types:constructor.Place
     * @return {string} id of the culture
     */

    /**
     * @ngdoc property
     * @name authorities.types:constructor.Place#iso
     * @propertyOf authorities.types:constructor.Place
     * @return {string} ISO place id; e.g., US-MN
     */

    /**
     * @ngdoc function
     * @name authorities.types:constructor.Date#$getNormalizedPlace
     * @methodOf authorities.types:constructor.Place
     * @function
     * @return {string} convenience function to return the first element of the normalized array
     */
    $getNormalizedPlace: function() {
      return maybe(this.normalized)[0];
    }
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
  exports.getDate = function(date, opts) {
    var params = {
      date: date,
      dataFormat: 'application/json'
    };
    return plumbing.get(helpers.getAuthoritiesServerUrl('/authorities/v1/date'), params, {'Accept': 'application/json'}, opts,
      helpers.compose(
        helpers.objectExtender({getDate: function() { return maybe(maybe(this.dates).date)[0]; }}),
        helpers.constructorSetter(Date, 'date', function(response) {
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
  exports.getPlaceSearch = function(place, opts) {
    var params = {
      place: place,
      view: 'simple',
      dataFormat: 'application/json'
    };
    return plumbing.get(helpers.getAuthoritiesServerUrl('/authorities/v1/place'), params, {'Accept': 'application/json'}, opts,
      helpers.compose(
        helpers.objectExtender({getPlaces: function() { return maybe(this.places).place; }}),
        helpers.constructorSetter(Place, 'place', function(response) {
          return response.places;
        })
      ));
  };

  // TODO authorities properties
  // TODO name authority
  // TODO culture authority

  return exports;
});
