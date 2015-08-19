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
  if (!this.data[role]) {
    this.data[role] = {};
  }
  if (person instanceof FS.Person) {
    this.data[role].resource = person.getPersonUrl();
    delete this.data[role].resourceId;
  }
  else if (this.helpers.isAbsoluteUrl(person)) {
    this.data[role].resource = person;
    delete this.data[role].resourceId;
  }
  else if (utils.isString(person)) {
    this.data[role].resourceId = person;
    delete this.data[role].resource;
  } else {
    this.data[role] = person;
  }
};

exports.deleteMember = function(role, changeMessage) {
  if (!this.deletedMembers) {
    this.deletedMembers = {};
  }
  this.deletedMembers[role] = changeMessage;
  delete this.data[role];
};

exports.setFacts = function(prop, values, changeMessage) {
  if (utils.isArray(this.data[prop])) {
    utils.forEach(this.data[prop], function(fact) {
      exports.deleteFact.call(this, prop, fact, changeMessage);
    }, this);
  }
  this.data[prop] = [];
  utils.forEach(values, function(value) {
    exports.addFact.call(this, prop, value);
  }, this);
};

exports.addFact = function(prop, value) {
  if (!utils.isArray(this.data[prop])) {
    this.data[prop] = [];
  }
  if (!(value instanceof FS.Fact)) {
    value = this.client.createFact(value);
  }
  this.data[prop].push(value);
};

exports.deleteFact = function(prop, value, changeMessage) {
  if (!(value instanceof FS.Fact)) {
    value = utils.find(this.data[prop], { id: value });
  }
  var pos = utils.indexOf(this.data[prop], value);
  if (pos >= 0) {
    // add fact to deletedFacts map; key is the href to delete
    var key = this.helpers.removeAccessToken(maybe(value.getLink('conclusion')).href);
    if (key) {
      if (!this.deletedFacts) {
        this.deletedFacts = {};
      }
      this.deletedFacts[key] = changeMessage;
    }
    // remove fact from array
    this.data[prop].splice(pos,1);
  }
};

module.exports = exports;