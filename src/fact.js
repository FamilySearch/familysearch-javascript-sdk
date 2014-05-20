define([
  'attribution',
  'authorities',
  'helpers'
], function(attribution, authorities, helpers) {
  /**
   * @ngdoc overview
   * @name fact
   * @description
   * Fact
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**********************************/
  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact
   * @description
   *
   * Fact
   * @param {Object=} data with optional attributes
   * {type, date, formalDate, place, normalizedPlace, changeMessage}
   **********************************/

  var Fact = exports.Fact = function(data) {
    if (data) {
      if (data.type) {
        //noinspection JSUnresolvedFunction
        this.$setType(data.type);
      }
      if (data.date) {
        //noinspection JSUnresolvedFunction
        this.$setDate(data.date);
      }
      if (data.formalDate) {
        //noinspection JSUnresolvedFunction
        this.$setFormalDate(data.formalDate);
      }
      if (data.place) {
        //noinspection JSUnresolvedFunction
        this.$setPlace(data.place);
      }
      if (data.normalizedPlace) {
        //noinspection JSUnresolvedFunction
        this.$setNormalizedPlace(data.normalizedPlace);
      }
      if (data.changeMessage) {
        //noinspection JSUnresolvedFunction
        this.$setChangeMessage(data.changeMessage);
      }
    }
  };

  exports.Fact.prototype = {
    constructor: Fact,
    /**
     * @ngdoc property
     * @name fact.types:constructor.Fact#id
     * @propertyOf fact.types:constructor.Fact
     * @return {String} Id of the name
     */

    /**
     * @ngdoc property
     * @name fact.types:constructor.Fact#type
     * @propertyOf fact.types:constructor.Fact
     * @return {String} http://gedcomx.org/Birth, etc.
     */

    /**
     * @ngdoc property
     * @name fact.types:constructor.Fact#value
     * @propertyOf fact.types:constructor.Fact
     * @return {String} Description (some facts have descriptions)
     */

    /**
     * @ngdoc property
     * @name fact.types:constructor.Fact#attribution
     * @propertyOf fact.types:constructor.Fact
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getDate
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} original date
     */
    $getDate: function() { return maybe(this.date).original; },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getNormalizedDate
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} normalized place text
     */
    $getNormalizedDate: function() { return maybe(maybe(maybe(this.date).normalized)[0]).value; },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getFormalDate
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} date in gedcomx format; e.g., +1836-04-13
     */
    $getFormalDate: function() { return maybe(this.date).formal; },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getPlace
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} event place
     */
    $getPlace: function() { return maybe(this.place).original; },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getNormalizedPlace
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} normalized place text
     */
    $getNormalizedPlace: function() { return maybe(maybe(maybe(this.place).normalized)[0]).value; },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$getNormalizedPlaceId
     * @methodOf fact.types:constructor.Fact
     * @function
     * @return {String} normalized place id
     */
    $getNormalizedPlaceId: function() {
      var desc = maybe(this.place).description;
      return (desc && desc.charAt(0) === '#') ? desc.substr(1) : '';
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setType
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the fact type
     * @param {String} type e.g., http://gedcomx.org/Birth
     * @return {Fact} this fact
     */
    $setType: function(type) {
      this.$changed = true;
      this.type = type;
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setDate
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the fact date; original and formal date forms must be set -
     * if normalized form is not set it is set by the server
     * @param {String|Object|Date} date either a date string as written by the user (in which case you must also call $setFormalDate()),
     * or a {original, formal, normalized} object, or a {@link authorities.types:constructor.Date Date} object
     * @return {Fact} this fact
     */
    $setDate: function(date) {
      this.$changed = true;
      var originalDate;
      if (helpers.isString(date)) {
        originalDate = date;
      }
      else if (date instanceof authorities.Date) {
        originalDate = date.original;
        //noinspection JSUnresolvedFunction
        this.$setFormalDate(date.$getFormalDate());
        this.$setNormalizedDate(date.normalized);
      }
      else if (helpers.isObject(date)) {
        originalDate = date.original;
        this.$setFormalDate(date.formal);
        this.$setNormalizedDate(date.normalized);
      }
      if (!!originalDate) {
        if (!this.date) {
          this.date = {};
        }
        this.date.original = originalDate;
      }
      else {
        delete this.date;
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setFormalDate
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the formal date
     * @param {String} formalDate from the date authority; e.g., +1836-04-06
     * @return {Fact} this fact
     */
    $setFormalDate: function(formalDate) {
      this.$changed = true;
      if (!!formalDate) {
        if (!this.date) {
          this.date = {};
        }
        this.date.formal = formalDate;
      }
      else if (this.date) {
        delete this.date.formal;
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setNormalizedDate
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the normalized date
     * @param {String} normalizedDate; e.g., 6 April 1836
     * @return {Fact} this fact
     */
    $setNormalizedDate: function(normalizedDate) {
      this.$changed = true;
      if (!!normalizedDate) {
        if (!this.date) {
          this.date = {};
        }
        this.date.normalized = [{ value: normalizedDate }];
      }
      else if (this.date) {
        delete this.date.normalized;
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setPlace
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the place; original and normalized forms must be set
     * @param {String|Object|Date} place either a place string as written by the user (in which case you must also call $setNormalizedPlace()),
     * or a {original, normalized} object, or a {@link authorities.types:constructor.Place Place} object
     * @return {Fact} this fact
     */
    $setPlace: function(place) {
      this.$changed = true;
      var originalPlace;
      if (helpers.isString(place) || place == null) {
        originalPlace = place;
      }
      else if (place instanceof authorities.Place) {
        originalPlace = place.original;
        //noinspection JSUnresolvedFunction
        this.$setNormalizedPlace(place.$getNormalizedPlace());
      }
      else if (helpers.isObject(place)) {
        originalPlace = place.original;
        this.$setNormalizedPlace(place.normalized);
      }
      if (!!originalPlace) {
        if (!this.place) {
          this.place = {};
        }
        this.place.original = originalPlace;
      }
      else {
        delete this.place;
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setNormalizedPlace
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the standard place text
     * @param {String} normalizedPlace from the place authority
     * @return {Fact} this fact
     */
    $setNormalizedPlace: function(normalizedPlace) {
      this.$changed = true;
      if (!!normalizedPlace) {
        if (!this.place) {
          this.place = {};
        }
        this.place.normalized = [{ value: normalizedPlace }];
      }
      else if (this.place) {
        delete this.place.normalized;
      }
      //noinspection JSValidateTypes
      return this;
    },

    /**
     * @ngdoc function
     * @name fact.types:constructor.Fact#$setChangeMessage
     * @methodOf fact.types:constructor.Fact
     * @function
     * @description sets the changeMessage used to update the fact
     * @param {String} changeMessage change message
     * @return {Fact} this fact
     */
    $setChangeMessage: function(changeMessage) {
      this.attribution = new attribution.Attribution(changeMessage);
      //noinspection JSValidateTypes
      return this;
    }
  };

  return exports;
});
