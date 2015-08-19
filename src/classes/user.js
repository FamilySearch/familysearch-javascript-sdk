var FS = require('../FamilySearch'),
    utils = require('../utils');

/**
 * @ngdoc function
 * @name user.types:constructor.User
 * @description
 *
 * User - a user is returned from {@link user.functions:getCurrentUser getCurrentUser};
 * Contributor Ids are agent ids, not user ids.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object} data raw object data
 */
var User = FS.User = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name user.functions:createUser
 * @param {Object} data [User](https://familysearch.org/developers/docs/api/fs/User_json) data
 * @return {Object} {@link user.types:constructor.User User}
 * @description Create a {@link user.types:constructor.User User} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createUser = function(data){
  return new User(this, data);
};

User.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: User,
  
  /**
   * @ngdoc function
   * @name user.types:constructor.User#getId
   * @methodOf user.types:constructor.User
   * @return {String} Id of the user
   */
  getId: function() { return this.data.id; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getPersonId
   * @methodOf user.types:constructor.User
   * @return {String} id of the {@link person.types:constructor.Person Person} for this user
   */
  getPersonId: function() { return this.data.personId; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getTreeUserId
   * @methodOf user.types:constructor.User
   * @return {String} agent (contributor) id of the user
   */
  getTreeUserId: function() { return this.data.treeUserId; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getContactName
   * @methodOf user.types:constructor.User
   * @return {String} contact name
   */
  getContactName: function() { return this.data.contactName; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getDisplayName
   * @methodOf user.types:constructor.User
   * @return {String} full display name
   */
  getDisplayName: function() { return this.data.displayName; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getGivenName
   * @methodOf user.types:constructor.User
   * @return {String} given name
   */
  getGivenName: function() { return this.data.givenName; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getFamilyName
   * @methodOf user.types:constructor.User
   * @return {String} family name
   */
  getFamilyName: function() { return this.data.familyName; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getGender
   * @methodOf user.types:constructor.User
   * @return {String} MALE or FEMALE
   */
  getGender: function() { return this.data.gender; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getEmail
   * @methodOf user.types:constructor.User
   * @return {String} email address
   */
  getEmail: function() { return this.data.email; },

  /**
   * @ngdoc function
   * @name user.types:constructor.User#getPreferredLanguage
   * @methodOf user.types:constructor.User
   * @return {String} e.g., en
   */
  getPreferredLanguage: function() { return this.data.preferredLanguage; }
});