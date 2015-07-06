var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name vocabularies.types:constructor.VocabularyElement
 * @description
 *
 * An element in a vocabulary list.
 */
var VocabularyElement = FS.VocabularyElement = function(client, data){ 
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name vocabularies.functions:createVocabularyElement
 * @param {Object} data object with vocabulary element data
 * @return {Object} {@link vocabularies.types:constructor.VocabularyElement VocabularyElement}
 * @description Create a {@link vocabularies.types:constructor.VocabularyElement VocabularyElement} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createVocabularyElement = function(data){
  return new VocabularyElement(this, data);
};

VocabularyElement.prototype = {
  constructor: VocabularyElement,
  
  /**
   * @ngdoc property
   * @name vocabularies.types:constructor.VocabularyElement#id
   * @propertyOf vocabularies.types:constructor.VocabularyElement
   * @return {string} place id
   */
   
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyElement#$getLabel
   * @methodOf vocabularies.types:constructor.VocabularyElement
   * @function
   * @return {String} The label of this element.
   */
  $getLabel: function(){
    return utils.maybe(utils.maybe(this.labels)[0])['@value'];
  },
  
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyElement#$getDescription
   * @methodOf vocabularies.types:constructor.VocabularyElement
   * @function
   * @return {String} The description of this element.
   */
  $getDescription: function(){
    return utils.maybe(utils.maybe(this.descriptions)[0])['@value'];
  }
   
};