var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name vocabularies.types:constructor.VocabularyList
 * @description
 *
 * A vocabulary list.
 */
var VocabularyList = FS.VocabularyList = function(client, data){ 
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(data.elements){
      utils.forEach(this.elements, function(element, i, list){
        list[i] = client.createVocabularyElement(element);
      });
    }
  }
};

/**
 * @ngdoc function
 * @name places.functions:createVocabularyList
 * @param {Object} data
 * @return {Object} {@link vocabularies.types:constructor.VocabularyList VocabularyList}
 * @description Create a {@link vocabularies.types:constructor.VocabularyList VocabularyList} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createVocabularyList = function(data){
  return new VocabularyList(this, data);
};

VocabularyList.prototype = {
  constructor: VocabularyList,
   
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyList#$getTitle
   * @methodOf vocabularies.types:constructor.VocabularyList
   * @function
   * @return {String} The label of this element.
   */
  $getTitle: function(){
    return utils.maybe(this.title);
  },
  
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyList#$getDescription
   * @methodOf vocabularies.types:constructor.VocabularyList
   * @function
   * @return {String} The description of this element.
   */
  $getDescription: function(){
    return utils.maybe(this.description);
  },
  
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyList#$getElements
   * @methodOf vocabularies.types:constructor.VocabularyList
   * @function
   * @return {Array} An array of {@link vocabularies.types:constructor.VocabularyElement VocabularyElements}.
   */
  $getElements: function(){
    return utils.maybe(this.elements);
  }
   
};