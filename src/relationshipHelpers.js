var FS = require('./FamilySearch'),
    utils = require('./utils'),
    maybe = utils.maybe,
    exports = {};

/**
 * Relationship helper functions.
 * Only work when called with `this` set to the relationship.
 * `setMember.call(relationship, role, person)`
 * Export in a module so we can use them between
 * Couple and ChildAndParent relationships
 **/

// person may be a Person, a URL, or an ID
exports.setMember = function(role, person) {
  if (!this[role]) {
    this[role] = {};
  }
  if (person instanceof FS.Person) {
    this[role].resource = person.$getPersonUrl();
    delete this[role].resourceId;
  }
  else if (this.$helpers.isAbsoluteUrl(person)) {
    this[role].resource = person;
    delete this[role].resourceId;
  }
  else if (utils.isString(person)) {
    this[role].resourceId = person;
    delete this[role].resource;
  } else {
    this[role] = person;
  }
};

exports.deleteMember = function(role, changeMessage) {
  if (!this.$deletedMembers) {
    this.$deletedMembers = {};
  }
  this.$deletedMembers[role] = changeMessage;
  delete this[role];
};

exports.setFacts = function(prop, values, changeMessage) {
  var self = this;
  if (utils.isArray(this[prop])) {
    utils.forEach(this[prop], function(fact) {
      exports.deleteFact.call(this, prop, fact, changeMessage);
    }, this);
  }
  this[prop] = [];
  utils.forEach(values, function(value) {
    exports.addFact.call(this, prop, value);
  }, this);
};

exports.addFact = function(prop, value) {
  if (!utils.isArray(this[prop])) {
    this[prop] = [];
  }
  if (!(value instanceof FS.Fact)) {
    value = this.$client.createFact(value);
  }
  this[prop].push(value);
};

exports.deleteFact = function(prop, value, changeMessage) {
  if (!(value instanceof FS.Fact)) {
    value = utils.find(this[prop], { id: value });
  }
  var pos = utils.indexOf(this[prop], value);
  if (pos >= 0) {
    // add fact to $deletedFacts map; key is the href to delete
    var key = this.$helpers.removeAccessToken(maybe(maybe(maybe(value).links).conclusion).href);
    if (key) {
      if (!this.$deletedFacts) {
        this.$deletedFacts = {};
      }
      this.$deletedFacts[key] = changeMessage;
    }
    // remove fact from array
    this[prop].splice(pos,1);
  }
};

module.exports = exports;