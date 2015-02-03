if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
  './attribution',
  './helpers',
  './plumbing'
], function(attribution, helpers, plumbing) {
  /**
   * @ngdoc overview
   * @name notes
   * @description
   * Functions related to notes
   *
   * {@link https://familysearch.org/developers/docs/api/resources#notes FamilySearch API Docs}
   */

  var maybe = helpers.maybe; // shorthand

  var exports = {};

  /**********************************/
  /**
   * @ngdoc function
   * @name notes.types:constructor.Note
   * @description
   *
   * Note
   * To create a new note, you must set subject, text, and either $personId, $childAndParentsId, or $coupleId.
   *
   * @param {Object=} data an object with optional attributes {subject, text, $personId, $childAndParentsId, $coupleId}
   **********************************/

  var Note = exports.Note = function(data) {
    if (data) {
      this.subject = data.subject;
      this.text = data.text;
      this.$personId = data.$personId;
      this.$childAndParentsId = data.$childAndParentsId;
      this.$coupleId = data.$coupleId;
    }
  };

  exports.Note.prototype = {
    constructor: Note,
    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#id
     * @propertyOf notes.types:constructor.Note
     * @return {String} Id of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#subject
     * @propertyOf notes.types:constructor.Note
     * @return {String} subject / title of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#text
     * @propertyOf notes.types:constructor.Note
     * @return {String} text of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#attribution
     * @propertyOf notes.types:constructor.Note
     * @returns {Attribution} {@link attribution.types:constructor.Attribution Attribution} object
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#$personId
     * @propertyOf notes.types:constructor.Note
     * @return {String} Id of the person to which this note is attached if it is a person note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#$childAndParentsId
     * @propertyOf notes.types:constructor.Note
     * @return {String} Id of the child and parents relationship to which this note is attached if it is a child and parents note
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.Note#$coupleId
     * @propertyOf notes.types:constructor.Note
     * @return {String} Id of the couple relationship to which this note is attached if it is a couple note
     */

    /**
     * @ngdoc function
     * @name notes.types:constructor.Note#$getNoteUrl
     * @methodOf notes.types:constructor.Note
     * @function
     * @return {String} note URL (without the access token)
     */
    $getNoteUrl: function() { return helpers.removeAccessToken(maybe(maybe(this.links).note).href); },

    /**
     * @ngdoc function
     * @name notes.types:constructor.Note#$save
     * @methodOf notes.types:constructor.Note
     * @function
     * @description
     * Create a new note (if this note does not have an id) or update the existing note
     *
     * {@link http://jsfiddle.net/DallanQ/6fVkh/ editable example}
     *
     * @param {string} changeMessage change message
     * @param {boolean=} refresh true to read the note after updating
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise of the note id, which is fulfilled after the note has been updated,
     * and if refresh is true, after the note has been read.
     */
    $save: function(changeMessage, refresh, opts) {
      var self = this;
      var template, label;
      var headers = {};
      if (self.$personId) {
        template = self.id ? 'person-note-template' : 'person-notes-template';
        label = 'persons';
      }
      else if (self.$coupleId) {
        template = self.id ? 'couple-relationship-note-template' : 'couple-relationship-notes-template';
        label = 'relationships';
      }
      else if (self.$childAndParentsId) {
        template = self.id ? 'child-and-parents-relationship-note-template' : 'child-and-parents-relationship-notes-template';
        label = 'childAndParentsRelationships';
        headers['Content-Type'] = 'application/x-fs-v1+json';
      }
      var promise = helpers.chainHttpPromises(
        plumbing.getUrl(template, null, {pid: self.$personId, crid: self.$coupleId, caprid: self.$childAndParentsId, nid: self.id}),
        function(url) {
          var payload = {};
          payload[label] = [ { notes: [ self ] } ];
          if (changeMessage) {
            payload[label][0].attribution = new attribution.Attribution(changeMessage);
          }
          return plumbing.post(url, payload, headers, opts, function(data, promise) {
            // x-entity-id and location headers are not set on update, only on create
            return {
              id: self.id || promise.getResponseHeader('X-ENTITY-ID'),
              location: self.$getNoteUrl() || helpers.removeAccessToken(promise.getResponseHeader('Location'))
            };
          });
        });
      var returnedPromise = promise.then(function(idLocation) {
        helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
        if (refresh) {
          // re-read the note and set this object's properties from response
          // we use getPersonNote here to read couple and child-and-parents notes also
          // it's ok to do this since we pass in the full url
          return exports.getPersonNote(idLocation.location, null, {}, opts).then(function(response) {
            helpers.deletePropertiesPartial(self, helpers.appFieldRejector);
            helpers.extend(self, response.getNote());
            return idLocation.id;
          });
        }
        else {
          return idLocation.id;
        }
      });
      return returnedPromise;
    },

    /**
     * @ngdoc function
     * @name notes.types:constructor.Note#$delete
     * @methodOf notes.types:constructor.Note
     * @function
     * @description delete this note
     * or {@link notes.functions:deleteCoupleNote deleteCoupleNote}
     * or {@link notes.functions:deleteChildAndParentsNote deleteChildAndParentsNote}
     * @param {string=} changeMessage change message
     * @param {Object=} opts options to pass to the http function specified during init
     * @return {Object} promise for the note URL
     */
    $delete: function(changeMessage, opts) {
      if (this.$personId) {
        return exports.deletePersonNote(this.$getNoteUrl() || this.$personId, this.id, changeMessage, opts);
      }
      else if (this.$coupleId) {
        return exports.deleteCoupleNote(this.$getNoteUrl() || this.$coupleId, this.id, changeMessage, opts);
      }
      else {
        return exports.deleteChildAndParentsNote(this.$getNoteUrl() || this.$childAndParentsId, this.id, changeMessage, opts);
      }
    }

  };

  function getRoot(obj) {
    if (obj) {
      if (obj.persons) {
        return obj.persons;
      }
      else if (obj.childAndParentsRelationships) {
        return obj.childAndParentsRelationships;
      }
      else if (obj.relationships) {
        return obj.relationships;
      }
    }
    return {};
  }

  function getNote(url, params, opts) {
    return plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts, // child and parents note requires x-fs-v1; others allow fs or gedcomx
      helpers.compose(
        helpers.objectExtender({getNote: function() {
          return maybe(maybe(getRoot(this)[0]).notes)[0];
        }}),
        helpers.constructorSetter(Note, 'notes', function(response) {
          return getRoot(response)[0];
        }),
        helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
          return maybe(getRoot(response)[0]).notes;
        }),
        helpers.objectExtender(function(response) {
          var label = response.persons ? '$personId' : (response.childAndParentsRelationships ? '$childAndParentsId' : '$coupleId');
          var result = {};
          result[label] = maybe(getRoot(response)[0]).id;
          return result;
        }, function(response) {
          return maybe(getRoot(response)[0]).notes;
        })
      ));
  }

  function getMultiNote(id, nids, params, opts, getNoteFn) {
    var promises = {};
    if (helpers.isArray(id)) {
      helpers.forEach(id, function(e) {
        promises[e] = getNoteFn(e, null, params, opts);
      });
    }
    else {
      helpers.forEach(nids, function(nid) {
        promises[nid] = getNoteFn(id, nid, params, opts);
      });
    }
    return promises;
  }

  /**
   * @ngdoc function
   * @name notes.functions:getPersonNote
   * @function
   *
   * @description
   * Get information about a note
   * The response includes the following convenience function
   *
   * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/96EkL/ editable example}
   *
   * @param {string} pid id of the person or full URL of the note
   * @param {string=} nid id of the note (required if pid is the id of the person)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNote = function(pid, nid, params, opts) {
    // NOTE: this function is called in note.$save() to read couple and child-and-parents notes also by passing in the full note URL
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-note-template', pid, {pid: pid, nid: nid}),
      function(url) {
        return getNote(url, params, opts);
      });
  };

  /**
   * @ngdoc function
   * @name notes.functions:getMultiPersonNote
   * @function
   *
   * @description
   * Get multiple notes at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/5dLd4/ editable example}
   *
   * @param {string|string[]} pid id of the person, or full URLs of the notes
   * @param {string[]=} nids ids of the notes (required if pid is the id of the person)
   * @param {Object=} params pass to getPersonNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id or URL to {@link notes.functions:getPersonNote getPersonNote} response
   */
  exports.getMultiPersonNote = function(pid, nids, params, opts) {
    var promises = getMultiNote(pid, nids, params, opts, exports.getPersonNote);
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name notes.functions:getCoupleNote
   * @function
   *
   * @description
   * Get information about a couple relationship note
   * The response includes the following convenience function
   *
   * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/T7xj2/ editable example}
   *
   * @param {string} crid id of the couple relationship or full URL of the note
   * @param {string=} nid id of the note (required if crid is the id of the couple relationship)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleNote = function(crid, nid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-note-template', crid, {crid: crid, nid: nid}),
      function(url) {
        return getNote(url, params, opts);
      });
  };

  /**
   * @ngdoc function
   * @name notes.functions:getMultiCoupleNote
   * @function
   *
   * @description
   * Get multiple notes at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/TsFky/ editable example}
   *
   * @param {string|string[]} crid id of the couple relationship, or full URLs of the notes
   * @param {string[]=} nids ids of the notes (required if crid is the id of the couple relationship)
   * @param {Object=} params pass to getCoupleNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id to {@link notes.functions:getCoupleNote getCoupleNote} response
   */
  exports.getMultiCoupleNote = function(crid, nids, params, opts) {
    var promises = getMultiNote(crid, nids, params, opts, exports.getCoupleNote);
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name notes.functions:getChildAndParentsNote
   * @function
   *
   * @description
   * Get information about a child and parents relationship note
   * The response includes the following convenience function
   *
   * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/dV9uQ/ editable example}
   *
   * @param {string} caprid id of the child and parents relationship or full URL of the note
   * @param {string=} nid id of the note (required if caprid is the id of the child and parents relationship)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsNote = function(caprid, nid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-note-template', caprid, {caprid: caprid, nid: nid}),
      function(url) {
        return getNote(url, params, opts);
      });
  };

  /**
   * @ngdoc function
   * @name notes.functions:getMultiChildAndParentsNote
   * @function
   *
   * @description
   * Get multiple notes at once by requesting them in parallel
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/fn8NU/ editable example}
   *
   * @param {string|string[]} caprid id of the child and parents relationship, or full URLs of the notes
   * @param {string[]=} nids ids of the notes (required if caprid is the id of the child and parents relationship)
   * @param {Object=} params pass to getChildAndParentsNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id to {@link notes.functions:getChildAndParentsNote getChildAndParentsNote} response
   */
  exports.getMultiChildAndParentsNote = function(caprid, nids, params, opts) {
    var promises = getMultiNote(caprid, nids, params, opts, exports.getChildAndParentsNote);
    return helpers.promiseAll(promises);
  };

  /**
   * @ngdoc function
   * @name notes.functions:getPersonNotes
   * @function
   *
   * @description
   * Get notes for a person
   * The response includes the following convenience function
   *
   * - `getNotes()` - get an array of {@link notes.types:constructor.Note Notes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/3enGw/ editable example}
   *
   * @param {String} pid id of the person or full URL of the person-notes endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNotes = function(pid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-notes-template', pid, {pid: pid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getNotes: function() {
              return maybe(maybe(maybe(this).persons)[0]).notes || [];
            }}),
            helpers.constructorSetter(Note, 'notes', function(response) {
              return maybe(maybe(response).persons)[0];
            }),
            helpers.objectExtender(function(response) {
              return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).persons)[0]).notes;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return maybe(maybe(maybe(response).persons)[0]).notes;
            })
          ));
      });
  };

  /**
   * @ngdoc function
   * @name notes.functions:getCoupleNotes
   * @function
   *
   * @description
   * Get the notes for a couple relationship
   * The response includes the following convenience function
   *
   * - `getNotes()` - get an array of {@link notes.types:constructor.Note Notes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/qe2dc/ editable example}
   *
   * @param {String} crid id of the couple relationship or full URL of the couple-relationship-notes endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleNotes = function(crid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-notes-template', crid, {crid: crid}),
      function(url) {
        return plumbing.get(url, params, {}, opts,
          helpers.compose(
            helpers.objectExtender({getNotes: function() {
              return maybe(maybe(this.relationships)[0]).notes || [];
            }}),
            helpers.constructorSetter(Note, 'notes', function(response) {
              return maybe(maybe(response).relationships)[0];
            }),
            helpers.objectExtender(function(response) {
              return { $coupleId: maybe(maybe(maybe(response).relationships)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).relationships)[0]).notes;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return maybe(maybe(maybe(response).relationships)[0]).notes;
            })
          ));
      });
  };

  /**
   * @ngdoc function
   * @name notes.functions:getChildAndParentsNotes
   * @function
   *
   * @description
   * Get the notes for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getNotes()` - get an array of {@link notes.types:constructor.Note Notes} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/SV8Hs/ editable example}
   *
   * @param {String} caprid id of the child and parents relationship or full URL of the child-and-parents-relationship-notes endpoint
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsNotes = function(caprid, params, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-notes-template', caprid, {caprid: caprid}),
      function(url) {
        return plumbing.get(url, params,
          {'Accept': 'application/x-fs-v1+json'}, opts,
          helpers.compose(
            helpers.objectExtender({getNotes: function() {
              return maybe(maybe(this.childAndParentsRelationships)[0]).notes || [];
            }}),
            helpers.constructorSetter(Note, 'notes', function(response) {
              return maybe(maybe(response).childAndParentsRelationships)[0];
            }),
            helpers.objectExtender(function(response) {
              return { $childAndParentsId: maybe(maybe(maybe(response).childAndParentsRelationships)[0]).id };
            }, function(response) {
              return maybe(maybe(maybe(response).childAndParentsRelationships)[0]).notes;
            }),
            helpers.constructorSetter(attribution.Attribution, 'attribution', function(response) {
              return maybe(maybe(maybe(response).childAndParentsRelationships)[0]).notes;
            })
          ));
      });
  };

  /**
   * @ngdoc function
   * @name notes.functions:deletePersonNote
   * @function
   *
   * @description
   * Delete the specified person note
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/wMmn7/ editable example}
   *
   * @param {string} pid person id or full URL of the note
   * @param {string=} nid id of the note (must be set if pid is an id and not the full URL of the note)
   * @param {string=} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the pid
   */
  exports.deletePersonNote = function(pid, nid, changeMessage, opts) {
    // this function is called from note.$delete() also to delete couple notes and child-and-parents notes by passing in the full URL
    return helpers.chainHttpPromises(
      plumbing.getUrl('person-note-template', pid, {pid: pid, nid: nid}),
      function(url) {
        // need to use x-fs-v1+json, required for child-and-parents notes
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        if (changeMessage) {
          headers['X-Reason'] = changeMessage;
        }
        return plumbing.del(url, headers, opts, function() {
          return pid;
        });
      }
    );
  };

  /**
   * @ngdoc function
   * @name notes.functions:deleteCoupleNote
   * @function
   *
   * @description
   * Delete the specified couple note
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource FamilySearch API Docs}
   *
   * @param {string} crid couple relationship id or full URL of the note
   * @param {string=} nid id of the note (must be set if crid is an id and not the full URL of the note)
   * @param {string=} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the crid
   */
  exports.deleteCoupleNote = function(crid, nid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('couple-relationship-note-template', crid, {crid: crid, nid: nid}),
      function(url) {
        var headers = {};
        if (changeMessage) {
          headers['X-Reason'] = changeMessage;
        }
        return plumbing.del(url, headers, opts, function() {
          return crid;
        });
      }
    );
  };

  /**
   * @ngdoc function
   * @name notes.functions:deleteChildAndParentsNote
   * @function
   *
   * @description
   * Delete the specified child-and-parents note
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource FamilySearch API Docs}
   *
   * @param {string} caprid child-and-parents relationship id or full URL of the note
   * @param {string=} nid id of the note (must be set if caprid is an id and not the full URL of the note)
   * @param {string=} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the pid
   */
  exports.deleteChildAndParentsNote = function(caprid, nid, changeMessage, opts) {
    return helpers.chainHttpPromises(
      plumbing.getUrl('child-and-parents-relationship-note-template', caprid, {caprid: caprid, nid: nid}),
      function(url) {
        var headers = {'Content-Type': 'application/x-fs-v1+json'};
        if (changeMessage) {
          headers['X-Reason'] = changeMessage;
        }
        return plumbing.del(url, headers, opts, function() {
          return caprid;
        });
      }
    );
  };

  return exports;
});
