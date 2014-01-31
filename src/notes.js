define([
  'attribution',
  'helpers',
  'plumbing'
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

  /**
   * @ngdoc function
   * @name notes.types:constructor.NoteRef
   * @description
   *
   * Reference to a note on a person
   */
  var NoteRef = exports.NoteRef = function() {

  };

  exports.NoteRef.prototype = {
    constructor: NoteRef,
    /**
     * @ngdoc property
     * @name notes.types:constructor.NoteRef#id
     * @propertyOf notes.types:constructor.NoteRef
     * @return {String} Id of the note - pass into {@link notes.functions.getPersonNote getPersonNote},
     * {@link notes.functions.getCoupleNote getCoupleNote}, or {@link notes.functions.getChildAndParentsNote getChildAndParentsNote}
     * for details
     */

    /**
     * @ngdoc property
     * @name notes.types:constructor.NoteRef#subject
     * @propertyOf notes.types:constructor.NoteRef
     * @return {String} subject of the note
     */

    /**
     * @ngdoc function
     * @name notes.types:constructor.NoteRef#$getNoteUrl
     * @methodOf notes.types:constructor.NoteRef
     * @function
     * @return {string} URL of the note - pass into {@link notes.functions:getPersonNote getPersonNote},
     * {@link notes.functions:getCoupleNote getCoupleNote}, or
     * {@link notes.functions:getChildAndParentsNote getChildAndParentsNote} for details
     */
    $getNoteUrl: function() {
      var url = helpers.removeAccessToken(this.links.note.href);
      // TODO remove this when person note.href contains note id like it should
      if (url.indexOf(this.id) === -1) {
        url += '/' + this.id;
      }
      return url;
    },

    /**
     * @ngdoc function
     * @name notes.types:constructor.NoteRef#$getNote
     * @methodOf notes.types:constructor.NoteRef
     * @function
     * @return {Object} promise for the {@link sources.functions:getPersonNote getPersonNote},
     * {@link sources.functions:getCoupleNote getCoupleNote}, or
     * {@link sources.functions:getChildAndParentsNote getChildAndParentsNote} response
     */
    $getNote: function() {
      return getNote(this.$getNoteUrl());
    }
  };

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note
   * @description
   *
   * Note
   */
  var Note = exports.Note = function() {

  };

  exports.Note.prototype = {
    constructor: Note
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
  };

  /**
   * @ngdoc function
   * @name notes.functions:getPersonNoteRefs
   * @function
   *
   * @description
   * Get note references for a person
   * The response includes the following convenience function
   *
   * - `getNoteRefs()` - get an array of {@link notes.types:constructor.NoteRef NoteRefs} from the response
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
  exports.getPersonNoteRefs = function(pid, params, opts) {
    return plumbing.getUrl('person-notes-template', pid, {pid: pid}).then(function(url) {
      return plumbing.get(url, params, {}, opts,
        helpers.compose(
          helpers.objectExtender({getNoteRefs: function() { return maybe(maybe(this.persons)[0]).notes || []; }}),
          helpers.constructorSetter(NoteRef, 'notes', function(response) {
            return maybe(maybe(response).persons)[0];
          })
        ));
    });
  };

  /**
   * @ngdoc function
   * @name notes.functions:getCoupleNoteRefs
   * @function
   *
   * @description
   * Get the note references for a couple relationship
   * The response includes the following convenience function
   *
   * - `getNoteRefs()` - get an array of {@link notes.types:constructor.NoteRef NoteRefs} from the response
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
  exports.getCoupleNoteRefs = function(crid, params, opts) {
    return plumbing.getUrl('couple-relationship-notes-template', crid, {crid: crid}).then(function(url) {
      return plumbing.get(url, params, {}, opts,
        helpers.compose(
          helpers.objectExtender({getNoteRefs: function() { return maybe(maybe(this.relationships)[0]).notes || []; }}),
          helpers.constructorSetter(NoteRef, 'notes', function(response) {
            return maybe(maybe(response).relationships)[0];
          })
        ));
    });
  };

  /**
   * @ngdoc function
   * @name notes.functions:getChildAndParentsNoteRefs
   * @function
   *
   * @description
   * Get the note references for a child and parents relationship
   * The response includes the following convenience function
   *
   * - `getNoteRefs()` - get an array of {@link notes.types:constructor.NoteRef NoteRefs} from the response
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
  exports.getChildAndParentsNoteRefs = function(caprid, params, opts) {
    return plumbing.getUrl('child-and-parents-relationship-notes-template', caprid, {caprid: caprid}).then(function(url) {
      return plumbing.get(url, params,
        {'Accept': 'application/x-fs-v1+json'}, opts,
        helpers.compose(
          helpers.objectExtender({getNoteRefs: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).notes || []; }}),
          helpers.constructorSetter(NoteRef, 'notes', function(response) {
            return maybe(maybe(response).childAndParentsRelationships)[0];
          })
        ));
    });
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
        })
      ));
  }

  function getMultiNote(id, nids, params, opts, getNoteFn) {
    var promises = {};
    if (helpers.isArray(id)) {
      helpers.forEach(id, function(e) {
        var key, url;
        if (e instanceof NoteRef) {
          key = e.id;
          url = e.$getNoteUrl();
        }
        else {
          key = e;
          url = e;
        }
        promises[key] = getNoteFn(url, null, params, opts);
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
   * @param {string=} nid id of the note (required if pid is not the full URL of the note)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNote = function(pid, nid, params, opts) {
    return plumbing.getUrl('person-note-template', pid, {pid: pid, nid: nid}).then(function(url) {
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
   * @param {string|string[]||NoteRef[]} pid id of the person, or full URLs or {@link notes.types:constructor.NoteRef NoteRefs} of the notes
   * @param {string[]=} nids ids of the notes (required if pid is the id of the person)
   * @param {Object=} params pass to getPersonNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id or URL to response
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
   * @param {string=} nid id of the note (required if crid is not the full URL of the note)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleNote = function(crid, nid, params, opts) {
    return plumbing.getUrl('couple-relationship-note-template', crid, {crid: crid, nid: nid}).then(function(url) {
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
   * {@link http://jsfiddle.net/DallanQ/fn8NU/ editable example}
   *
   * @param {string|string[]||NoteRef[]} crid id of the couple relationship, or full URLs or {@link notes.types:constructor.NoteRef NoteRefs} of the notes
   * @param {string[]=} nids ids of the notes (required if crid is the id of the couple relationship)
   * @param {Object=} params pass to getCoupleNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id to response
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
   * @param {string=} nid id of the note (required if caprid is not the full URL of the note)
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsNote = function(caprid, nid, params, opts) {
    return plumbing.getUrl('child-and-parents-relationship-note-template', caprid, {caprid: caprid, nid: nid}).then(function(url) {
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
   * @param {string|string[]||NoteRef[]} caprid id of the child and parents relationship, or full URLs or {@link notes.types:constructor.NoteRef NoteRefs} of the notes
   * @param {string[]=} nids ids of the notes (required if caprid is the id of the child and parents relationship)
   * @param {Object=} params pass to getChildAndParentsNote currently unused
   * @param {Object=} opts pass to the http function specified during init
   * @return {Object} promise that is fulfilled when all of the notes have been read,
   * returning a map of note id to response
   */
  exports.getMultiChildAndParentsNote = function(caprid, nids, params, opts) {
    var promises = getMultiNote(caprid, nids, params, opts, exports.getChildAndParentsNote);
    return helpers.promiseAll(promises);
  };

  return exports;
});
