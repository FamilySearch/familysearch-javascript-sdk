var FS = require('./../FamilySearch'),
    utils = require('../utils');

/**
 * @ngdoc function
 * @name gender.types:constructor.Gender
 * @description
 *
 * Gender
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var Gender = FS.Gender = function(client, data) {
  FS.BaseClass.call(this, client, data);
  this.changed = false;
};

/**
 * @ngdoc function
 * @name gender.functions:createGender
 * @param {Object} data [Gender](https://familysearch.org/developers/docs/api/gx/Gender_json) data
 * @return {Object} {@link gender.types:constructor.Gender Gender}
 * @description Create a {@link gender.types:constructor.Gender Gender} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createGender = function(data){
  return new Gender(this, data);
};

Gender.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Gender,

  /**
   * @ngdoc function
   * @name gender.types:constructor.Gender#getType
   * @methodOf gender.types:constructor.Gender
   * @return {string} [gender type](https://familysearch.org/developers/docs/api/types/genderType_json)
   */
  getType: function(){
    return this.data.type;
  },
   
  /**
   * @ngdoc function
   * @name gender.types:constructor.Gender#setType
   * @methodOf gender.types:constructor.Gender
   * @param {string} type [gender type](https://familysearch.org/developers/docs/api/types/genderType_json)
   * @return {Gender} this Gender object
   */
  setType: function(type){
    this.changed = true;
    this.data.type = type;
    return this;
  }
  
});
