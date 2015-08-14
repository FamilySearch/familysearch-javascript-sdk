var FS = require('../FamilySearch'),
    utils = require('../utils');

/**
 * @ngdoc function
 * @name user.types:constructor.User
 * @description
 *
 * User - a user is returned from {@link user.functions:getCurrentUser getCurrentUser};
 * Contributor Ids are agent ids, not user ids.
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
  constructor: User
  /**
   * @ngdoc property
   * @name user.types:constructor.User#id
   * @propertyOf user.types:constructor.User
   * @return {String} Id of the user
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#personId
   * @propertyOf user.types:constructor.User
   * @return {String} id of the {@link person.types:constructor.Person Person} for this user
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#treeUserId
   * @propertyOf user.types:constructor.User
   * @return {String} agent (contributor) id of the user
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#contactName
   * @propertyOf user.types:constructor.User
   * @return {String} contact name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#displayName
   * @propertyOf user.types:constructor.User
   * @return {String} full display name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#givenName
   * @propertyOf user.types:constructor.User
   * @return {String} given name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#familyName
   * @propertyOf user.types:constructor.User
   * @return {String} family name
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#gender
   * @propertyOf user.types:constructor.User
   * @return {String} MALE or FEMALE
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#email
   * @propertyOf user.types:constructor.User
   * @return {String} email address
   */

  /**
   * @ngdoc property
   * @name user.types:constructor.User#preferredLanguage
   * @propertyOf user.types:constructor.User
   * @return {String} e.g., en
   */
});