var FS = require('./../FamilySearch'),
    utils = require('./../utils');

/**
 * @ngdoc function
 * @name vocabularies.types:constructor.VocabularyList
 * @description
 *
 * A vocabulary list.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var VocabularyList = FS.VocabularyList = function(client, data){ 
  FS.BaseClass.call(this, client, data);
  
  if(data){
    if(data.elements){
      utils.forEach(this.data.elements, function(element, i, list){
        if(!(element instanceof FS.VocabularyElement)){
          list[i] = client.createVocabularyElement(element);
        }
      });
    }
  }
};

/**
 * @ngdoc function
 * @name vocabularies.functions:createVocabularyList
 * @param {Object} data object with vocabulary list data
 * @return {Object} {@link vocabularies.types:constructor.VocabularyList VocabularyList}
 * @description Create a {@link vocabularies.types:constructor.VocabularyList VocabularyList} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createVocabularyList = function(data){
  return new VocabularyList(this, data);
};

VocabularyList.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: VocabularyList,
   
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyList#getTitle
   * @methodOf vocabularies.types:constructor.VocabularyList

   * @return {String} The label of this element.
   */
  getTitle: function(){
    return this.data.title;
  },
  
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyList#getDescription
   * @methodOf vocabularies.types:constructor.VocabularyList

   * @return {String} The description of this element.
   */
  getDescription: function(){
    return this.data.description;
  },
  
  /**
   * @ngdoc function
   * @name vocabularies.types:constructor.VocabularyList#getElements
   * @methodOf vocabularies.types:constructor.VocabularyList

   * @return {Array} An array of {@link vocabularies.types:constructor.VocabularyElement VocabularyElements}.
   */
  getElements: function(){
    return utils.maybe(this.data.elements);
  }
   
});