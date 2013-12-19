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
   * @name notes.types:type.NoteRef
   * @description
   *
   * Reference to a note on a person
   */
  var NoteRef = exports.NoteRef = function() {

  };

  exports.NoteRef.prototype = {
    constructor: NoteRef
    /**
     * @ngdoc property
     * @name notes.types:type.NoteRef#id
     * @propertyOf notes.types:type.NoteRef
     * @return {String} Id of the note - pass into {@link notes.functions.getPersonNote getPersonNote} for details
     */

    /**
     * @ngdoc property
     * @name notes.types:type.NoteRef#subject
     * @propertyOf notes.types:type.NoteRef
     * @return {String} subject of the note
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
   * - `getNoteRefs()` - get an array of {@link notes.types:type.NoteRef NoteRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Person_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/3enGw/ editable example}
   *
   * @param {String} pid of the person to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getPersonNoteRefs = function(pid, params, opts) {
    return plumbing.get('/platform/tree/persons/'+encodeURI(pid)+'/notes', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getNoteRefs: function() { return maybe(maybe(this.persons)[0]).notes || []; }}),
        helpers.constructorSetter(NoteRef, 'notes', function(response) {
          return maybe(maybe(response).persons)[0];
        })
      ));
  };

  /**
   * @ngdoc function
   * @name notes.types:type.Note
   * @description
   *
   * Note
   */
  var Note = exports.Note = function() {

  };

  exports.Note.prototype = {
    constructor: Note,
    /**
     * @ngdoc property
     * @name notes.types:type.Note#id
     * @propertyOf notes.types:type.Note
     * @return {String} Id of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:type.Note#subject
     * @propertyOf notes.types:type.Note
     * @return {String} subject / title of the note
     */

    /**
     * @ngdoc property
     * @name notes.types:type.Note#text
     * @propertyOf notes.types:type.Note
     * @return {String} text of the note
     */

    /**
     * @ngdoc function
     * @name notes.types:type.Note#getContributorId
     * @methodOf notes.types:type.Note
     * @function
     * @return {String} Id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
     */
    getContributorId: function() { return maybe(maybe(this.attribution).contributor).resourceId; },

    /**
     * @ngdoc function
     * @name notes.types:type.Note#getModified
     * @methodOf notes.types:type.Note
     * @function
     * @return {Number} timestamp
     */
    getModified: function() { return maybe(this.attribution).modified; }
  };

  /**
   * @ngdoc function
   * @name notes.functions:getPersonNote
   * @function
   *
   * @description
   * Get information about a note
   * The response includes the following convenience function
   *
   * - `getNote()` - get the {@link notes.types:type.Note Note} from the response
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
      helpers.compose(
        helpers.objectExtender({getNote: function() { return maybe(maybe(maybe(this.persons)[0]).notes)[0]; }}),
        helpers.constructorSetter(Note, 'notes', function(response) {
            return maybe(maybe(response).persons)[0];
        })
      ));
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
   * - `getNoteRefs()` - get an array of {@link notes.types:type.NoteRef NoteRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/qe2dc/ editable example}
   *
   * @param {String} crid of the couple relationship to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleNoteRefs = function(crid, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(crid)+'/notes', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getNoteRefs: function() { return maybe(maybe(this.relationships)[0]).notes || []; }}),
        helpers.constructorSetter(NoteRef, 'notes', function(response) {
          return maybe(maybe(response).relationships)[0];
        })
      ));
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
   * - `getNote()` - get the {@link notes.types:type.Note Note} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/T7xj2/ editable example}
   *
   * @param {String} crid of the couple relationship
   * @param {String} nid of the note
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getCoupleNote = function(crid, nid, params, opts) {
    return plumbing.get('/platform/tree/couple-relationships/'+encodeURI(crid)+'/notes/'+encodeURI(nid), params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getNote: function() { return maybe(maybe(maybe(this.relationships)[0]).notes)[0]; }}),
        helpers.constructorSetter(Note, 'notes', function(response) {
          return maybe(maybe(response).relationships)[0];
        })
      ));
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
   * - `getNoteRefs()` - get an array of {@link notes.types:type.NoteRef NoteRefs} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Notes_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ/SV8Hs/ editable example}
   *
   * @param {String} caprid of the child and parents relationship to read
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsNoteRefs = function(caprid, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(caprid)+'/notes', params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getNoteRefs: function() { return maybe(maybe(this.childAndParentsRelationships)[0]).notes || []; }}),
        helpers.constructorSetter(NoteRef, 'notes', function(response) {
          return maybe(maybe(response).childAndParentsRelationships)[0];
        })
      ));
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
   * - `getNote()` - get the {@link notes.types:type.Note Note} from the response
   *
   * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource FamilySearch API Docs}
   *
   * {@link http://jsfiddle.net/DallanQ// editable example}
   *
   * @param {String} caprid of the child and parents relationship
   * @param {String} nid of the note
   * @param {Object=} params currently unused
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the response
   */
  exports.getChildAndParentsNote = function(caprid, nid, params, opts) {
    return plumbing.get('/platform/tree/child-and-parents-relationships/'+encodeURI(caprid)+'/notes/'+encodeURI(nid), params, {}, opts,
      helpers.compose(
        helpers.objectExtender({getNote: function() { return maybe(maybe(maybe(this.childAndParentsRelationships)[0]).notes)[0]; }}),
        helpers.constructorSetter(Note, 'notes', function(response) {
          return maybe(maybe(response).childAndParentsRelationships)[0];
        })
      ));
  };

  return exports;
});
