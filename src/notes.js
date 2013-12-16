define([
  'helpers',
  'plumbing'
], function(helpers, plumbing) {
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
   * @name notes.functions:getPersonNotes
   * @function
   *
   * @description
   * Get note references for a person
   * The response includes the following convenience function
   *
   * - `getNotes()` - get the array of notes from the response; each has an `id` and a `subject`;
   * pass the `id` into {@link notes.functions:getPersonNote getPersonNote} for more information
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/3enGw/ editable example}
   *
   * @param {String} id of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNotes = function(id, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(id)+'/notes', params, {}, opts,
      helpers.objectExtender({getNotes: function() { return maybe(maybe(this.persons)[0]).notes || []; }}));
  };

  /**
   * @ngdoc function
   * @name notes.functions:getPersonNote
   * @function
   *
   * @description
   * Get information about a note
   * The response includes the following convenience functions
   *
   * - `getPersonId()`
   * - `getNoteId()`
   * - `getSubject()`
   * - `getText()`
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/96EkL/ editable example}
   *
   * @param {String} pid of the person
   * @param {String} nid of the note
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNote = function(pid, nid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/notes/'+encodeURI(nid), params, {}, opts,
      helpers.objectExtender(personNoteConvenienceFunctions));
  };

  var personNoteConvenienceFunctions = {
    getPersonId: function() { return maybe(maybe(this.persons)[0]).id; },
    getNoteId:   function() { return maybe(maybe(maybe(maybe(this.persons)[0]).notes)[0]).id; },
    getSubject:  function() { return maybe(maybe(maybe(maybe(this.persons)[0]).notes)[0]).subject; },
    getText:     function() { return maybe(maybe(maybe(maybe(this.persons)[0]).notes)[0]).text; }
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
   * - `getNotes()` - get the array of notes from the response; each has an `id` and a `subject`;
   * pass the `id` into {@link notes.functions:getCoupleNote getCoupleNote} for more information
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/qe2dc/ editable example}
   *
   * @param {String} id of the couple relationship to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleNotes = function(id, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(id)+'/notes', params, {}, opts,
      helpers.objectExtender({getNotes: function() { return maybe(maybe(this.relationships)[0]).notes || []; }}));
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
   * - `getNotes()` - get the array of notes from the response; each has an `id` and a `subject`;
   * pass the `id` into {@link notes.functions:getChildAndParentsNote getChildAndParentsNote} for more information
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/SV8Hs/ editable example}
   *
   * @param {String} id of the child and parents relationship to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsNotes = function(id, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(id)+'/notes', params, {}, opts,
      helpers.objectExtender({getNotes: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).notes || []; }}));
  };

  // TODO getCoupleRelationshipNote
  // TODO getChildAndParentsRelationshipNote

  return exports;
});
