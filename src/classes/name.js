var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name name
 * @description
 * Name
 */

/**********************************/
/**
 * @ngdoc function
 * @name name.types:constructor.Name
 * @description
 *
 * Name
 *
 * @param {Object|String=} data either a fullText string or an object with optional attributes
 * {type, givenName, surname, prefix, suffix, fullText, preferred, changeMessage}
 **********************************/

var Name = function(client, data) {
  this.$client = client;
  if(data){
    if(utils.isString(data)){
      this.$setFullText(data);
    } else {
      utils.extend(this, data);
      if (data.type) {
        //noinspection JSUnresolvedFunction
        this.$setType(data.type);
      }
      if (data.givenName) {
        //noinspection JSUnresolvedFunction
        this.$setGivenName(data.givenName);
      }
      if (data.surname) {
        //noinspection JSUnresolvedFunction
        this.$setSurname(data.surname);
      }
      if (data.prefix) {
        //noinspection JSUnresolvedFunction
        this.$setPrefix(data.prefix);
      }
      if (data.suffix) {
        //noinspection JSUnresolvedFunction
        this.$setSuffix(data.suffix);
      }
      if (data.fullText) {
        //noinspection JSUnresolvedFunction
        this.$setFullText(data.fullText);
      }
      //noinspection JSUnresolvedFunction
      this.$setPreferred(!!data.preferred);
      if (data.changeMessage) {
        //noinspection JSUnresolvedFunction
        this.$setChangeMessage(data.changeMessage);
      }
      if (data.attribution && !(data.attribution instanceof FS.Attribution)) {
        this.attribution = client.createAttribution(data.attribution);
      }
    }
  }
};

// return the i'th name form; add it if it doesn't exist
function ensureNameForm(name, i) {
  var pos = i || 0; // just to be clear
  if (!utils.isArray(name.nameForms)) {
    name.nameForms = [];
  }
  while (pos >= name.nameForms.length) {
    name.nameForms.push({});
  }
  return name.nameForms[pos];
}

Name.prototype = {
  constructor: Name,
  /**
   * @ngdoc property
   * @name name.types:constructor.Name#id
   * @propertyOf name.types:constructor.Name
   * @return {String} Id of the name
   */

  /**
   * @ngdoc property
   * @name name.types:constructor.Name#type
   * @propertyOf name.types:constructor.Name
   * @return {String} http://gedcomx.org/BirthName, etc.
   */

  /**
   * @ngdoc property
   * @name name.types:constructor.Name#preferred
   * @propertyOf name.types:constructor.Name
   * @return {Boolean} true if this name is preferred
   */

  /**
   * @ngdoc property
   * @name name.types:constructor.Name#attribution
   * @propertyOf name.types:constructor.Name
   * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
   */

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getNameFormsCount
   * @methodOf name.types:constructor.Name
   * @function
   * @return {Number} get the number of name forms
   */
  $getNameFormsCount: function() { return this.nameForms ? this.nameForms.length : 0; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getNameForm
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {Number} get the `i`'th name form: each name form has `lang`, `fullText`, and `parts` properties
   */
  $getNameForm: function(i) { return maybe(this.nameForms)[i || 0]; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getFullText
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the full text of the `i`'th name form
   */
  $getFullText: function(i) { return maybe(this.$getNameForm(i)).fullText; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getLanguage
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the language of the `i`'th name form
   */
  $getLang: function(i) { return maybe(this.$getNameForm(i)).lang; },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getNamePart
   * @methodOf name.types:constructor.Name
   * @function
   * @description you can call $getGivenName, $getSurname, $getPrefix, or $getSuffix instead of this function
   * @param {String} type http://gedcomx.org/Given or http://gedcomx.org/Surname
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the specified part of the `i`'th name form
   */
  $getNamePart: function(type, i) {
    return maybe(utils.find(maybe(this.$getNameForm(i)).parts, {type: type})).value;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getGivenName
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the given part of the `i`'th name form
   */
  $getGivenName: function(i) {
    return this.$getNamePart('http://gedcomx.org/Given', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getSurname
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the surname part of the `i`'th name form
   */
  $getSurname: function(i) {
    return this.$getNamePart('http://gedcomx.org/Surname', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getPrefix
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the prefix part of the `i`'th name form
   */
  $getPrefix: function(i) {
    return this.$getNamePart('http://gedcomx.org/Prefix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$getSuffix
   * @methodOf name.types:constructor.Name
   * @function
   * @param {Number=} i name form to read; defaults to 0
   * @return {String} get the suffix part of the `i`'th name form
   */
  $getSuffix: function(i) {
    return this.$getNamePart('http://gedcomx.org/Suffix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setType
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} type e.g., http://gedcomx.org/BirthName
   * @return {Name} this name
   */
  $setType: function(type) {
    this.$changed = true;
    if (!!type) {
      this.type = type;
    }
    else {
      delete this.type;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setPreferred
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   *
   * __NOTE__: the preferred name flag can be set only when the person is initially created; after that it is read-only
   * @param {boolean} isPreferred true if preferred
   * @return {Name} this name
   */
  $setPreferred: function(isPreferred) {
    this.$changed = true;
    this.preferred = isPreferred;
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setFullText
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} fullText value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setFullText: function(fullText, i) {
    this.$changed = true;
    var nameForm = ensureNameForm(this, i);
    if (!!fullText) {
      nameForm.fullText = fullText;
    }
    else {
      delete nameForm.fullText;
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setNamePart
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value;
   * you can call $setGivenName, $setSurname, $setPrefix, and $setSuffix instead of this function
   * @param {String} name value
   * @param {String} type http://gedcomx.org/Given or http://gedcomx.org/Surname
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setNamePart: function(name, type, i) {
    this.$changed = true;
    var nameForm = ensureNameForm(this, i);
    if (!utils.isArray(nameForm.parts)) {
      nameForm.parts = [];
    }
    var part = utils.find(nameForm.parts, {type: type});
    if (!!name) {
      if (!part) {
        part = {type: type};
        nameForm.parts.push(part);
      }
      part.value = name;
    }
    else if (!!part) {
      nameForm.parts.splice(nameForm.parts.indexOf(part), 1);
    }
    //noinspection JSValidateTypes
    return this;
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setGivenName
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} givenName value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setGivenName: function(givenName, i) {
    return this.$setNamePart(givenName, 'http://gedcomx.org/Given', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setSurname
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} surname value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setSurname: function(surname, i) {
    return this.$setNamePart(surname, 'http://gedcomx.org/Surname', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setPrefix
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} prefix value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setPrefix: function(prefix, i) {
    return this.$setNamePart(prefix, 'http://gedcomx.org/Prefix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setSuffix
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the $changed flag as well as the value
   * @param {String} suffix value
   * @param {Number=} i name form to set; defaults to 0
   * @return {Name} this name
   */
  $setSuffix: function(suffix, i) {
    return this.$setNamePart(suffix, 'http://gedcomx.org/Suffix', i);
  },

  /**
   * @ngdoc function
   * @name name.types:constructor.Name#$setChangeMessage
   * @methodOf name.types:constructor.Name
   * @function
   * @description sets the changeMessage used to update the name
   * @param {String} changeMessage change message
   * @return {Name} this name
   */
  $setChangeMessage: function(changeMessage) {
    this.attribution = this.$client.createAttribution(changeMessage);
    //noinspection JSValidateTypes
    return this;
  }
};

module.exports = FS.Name = Name;
FS.prototype.createName = function(data){
  return new Name(this, data);
};
