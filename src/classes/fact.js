var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name fact
 * @description
 * Fact
 */

/**
 * @ngdoc function
 * @name fact.types:constructor.Fact
 * @description
 *
 * Fact
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var Fact = FS.Fact = function(client, data) {
  FS.BaseClass.call(this, client, data);
  
  if (data) {
    if (data.date) {
      this.setDate(data.date);
    }
    if (data.place) {
      this.setPlace(data.place);
    }
    if (data.attribution && !(data.attribution instanceof FS.Attribution)) {
      this.setAttribution(client.createAttribution(data.attribution));
    }
  }
  
  this.changed = false;
};

/**
 * @ngdoc function
 * @name fact.functions:createFact
 * @param {Object} data [Fact](https://familysearch.org/developers/docs/api/gx/Fact_json) data
 * @return {Object} {@link fact.types:constructor.Fact Fact}
 * @description Create a {@link fact.types:constructor.Fact Fact} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createFact = function(data){
  return new Fact(this, data);
};

Fact.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Fact,
  
  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getId
   * @methodOf fact.types:constructor.Fact
   * @return {String} Id of the name
   */

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getType
   * @methodOf fact.types:constructor.Fact
   * @return {String} http://gedcomx.org/Birth, etc.
   */
  getType: function() { return this.data.type; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getValue
   * @methodOf fact.types:constructor.Fact
   * @return {String} Description (some facts have descriptions)
   */
  getValue: function() { return this.data.value; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getDate
   * @methodOf fact.types:constructor.Fact
   * @return {Date} date
   */
  getDate: function() { return this.data.date; },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getOriginalDate
   * @methodOf fact.types:constructor.Fact
   * @return {String} original date
   */
  getOriginalDate: function() { 
    if(this.data.date){
      return this.data.date.getOriginal();
    }
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getNormalizedDate
   * @methodOf fact.types:constructor.Fact
   * @return {String} normalized place text
   */
  getNormalizedDate: function() { 
    if(this.data.date) {
      return this.data.date.getNormalized(); 
    }
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getFormalDate
   * @methodOf fact.types:constructor.Fact
   * @return {String} date in gedcomx format; e.g., +1836-04-13
   */
  getFormalDate: function() {  
    if(this.data.date) {
      return this.data.date.getFormal(); 
    }
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getPlace
   * @methodOf fact.types:constructor.Fact
   * @return {PlaceReference} event place
   */
  getPlace: function() { return this.data.place; },
  
  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getPlace
   * @methodOf fact.types:constructor.Fact
   * @return {PlaceReference} event place
   */
  getOriginalPlace: function(){ 
    if(this.data.place) {
      return this.data.place.getOriginal();
    }
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getNormalizedPlace
   * @methodOf fact.types:constructor.Fact
   * @return {String} normalized place text
   */
  getNormalizedPlace: function() { 
    if(this.data.place) {
      return this.data.place.getNormalized();
    }
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#getNormalizedPlaceId
   * @methodOf fact.types:constructor.Fact
   * @return {String} normalized place id
   */
  getNormalizedPlaceId: function() {
    var desc = maybe(this.data.place).description;
    return (desc && desc.charAt(0) === '#') ? desc.substr(1) : '';
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#isCustomNonEvent
   * @methodOf fact.types:constructor.Fact
   * @return {Boolean} true if this custom item is a non-event (i.e., fact)
   */
  isCustomNonEvent: function() {
    if (!!this.data.qualifiers) {
      var qual = utils.find(this.data.qualifiers, {name: 'http://familysearch.org/v1/Event'});
      return !!qual && qual.value === 'false';
    }
    return false;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setType
   * @methodOf fact.types:constructor.Fact
   * @description sets the fact type
   * @param {String} type e.g., http://gedcomx.org/Birth
   * @return {Fact} this fact
   */
  setType: function(type) {
    this.changed = true;
    this.data.type = type;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setCustomNonEvent
   * @methodOf fact.types:constructor.Fact
   * @description declares whether this custom item is a fact or an event
   * @param {boolean} isNonEvent true for non-event (i.e., fact)
   * @return {Fact} this fact
   */
  setCustomNonEvent: function(isNonEvent) {
    var pos;
    if (isNonEvent) {
      if (!this.data.qualifiers) {
        this.data.qualifiers = [];
      }
      pos = utils.findIndex(this.data.qualifiers, {name: 'http://familysearch.org/v1/Event'});
      if (pos < 0) {
        pos = this.data.qualifiers.push({name: 'http://familysearch.org/v1/Event'}) - 1;
      }
      this.data.qualifiers[pos].value = 'false';
    }
    else {
      if (!!this.data.qualifiers) {
        pos = utils.findIndex(this.data.qualifiers, {name: 'http://familysearch.org/v1/Event'});
        if (pos >= 0) {
          this.data.qualifiers.splice(pos, 1);
        }
        if (this.data.qualifiers.length === 0) {
          delete this.data.qualifiers;
        }
      }
    }
    this.changed = true;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setDate
   * @methodOf fact.types:constructor.Fact
   * @description sets the fact date
   * @param {Date|Object} date a {@link authorities.types:constructor.Date Date} object
   * @return {Fact} this fact
   */
  setDate: function(date) {
    this.changed = true;
    if (date instanceof FS.Date) {
      this.data.date = date;
    } else {
      this.data.date = this.client.createDate(date);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setOriginalDate
   * @methodOf fact.types:constructor.Fact
   * @description sets the fact's original date
   * @param {string} original original date string
   * @return {Fact} this fact
   */
  setOriginalDate: function(original) {
    this.changed = true;
    if(!this.data.date) {
      this.data.date = this.client.createDate();
    }
    this.data.date.setOriginal(original);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setFormalDate
   * @methodOf fact.types:constructor.Fact
   * @description sets the formal date
   * @param {String} formalDate from the date authority; e.g., +1836-04-06
   * @return {Fact} this fact
   */
  setFormalDate: function(formalDate) {
    this.changed = true;
    if(!this.data.date) {
      this.data.date = this.client.createDate();
    }
    this.data.date.setFormal(formalDate);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setNormalizedDate
   * @methodOf fact.types:constructor.Fact
   * @description sets the normalized date
   * @param {String} normalizedDate; e.g., 6 April 1836
   * @return {Fact} this fact
   */
  setNormalizedDate: function(normalizedDate) {
    this.changed = true;
    if(!this.data.date) {
      this.data.date = this.client.createDate();
    }
    this.data.date.setNormalized(normalizedDate);
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setPlace
   * @methodOf fact.types:constructor.Fact
   * @description sets the place; original and normalized forms must be set
   * @param {String|Object|Date} place either a place string as written by the user (in which case you must also call setNormalizedPlace()),
   * or a {original, normalized} object, or a {@link places.types:constructor.PlaceDescription PlaceDescription} object
   * @return {Fact} this fact
   */
  setPlace: function(place) {
    this.changed = true;
    if (place instanceof FS.PlaceReference) {
      this.data.place = place;
    } else if(place instanceof FS.PlaceDescription){
      this.data.place = this.client.createPlaceReference({
        original: place.getFullName(),
        normalized: place.getFullName()
      });
    } else {
      this.data.place = this.client.createPlaceReference(place);
    }
    //noinspection JSValidateTypes
    return this;
  },
  
  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setOriginalPlace
   * @methodOf fact.types:constructor.Fact
   * @description sets the original place text
   * @param {String} original place from the place authority
   * @return {Fact} this fact
   */
  setOriginalPlace: function(originalPlace){
    this.changed = true;
    if(!this.data.place){
      this.data.place = this.client.createPlaceReference();
    }
    this.data.place.setOriginal(originalPlace);
    return this;
  },

  /**
   * @ngdoc function
   * @name fact.types:constructor.Fact#setNormalizedPlace
   * @methodOf fact.types:constructor.Fact
   * @description sets the standard place text
   * @param {String} normalized place name
   * @return {Fact} this fact
   */
  setNormalizedPlace: function(normalizedPlace) {
    this.changed = true;
    if(!this.data.place){
      this.data.place = this.client.createPlaceReference();
    }
    this.data.place.setNormalized(normalizedPlace);
    return this;
  }
});
