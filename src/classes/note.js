var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name notes.types:constructor.Note
 * @description
 *
 * Note
 * 
 * To create a new note, you must set subject and text.
 * 
 * @param {FamilySearch} client FamilySearch sdk client
 * @param {Object=} data an object with optional attributes {subject, text, attribution}
 */
var Note = FS.Note = function(client, data) {
  FS.BaseClass.call(this, client, data);
  if(this.attribution && !(this.attribution instanceof FS.Attribution)){
    this.attribution = client.createAttribution(this.attribution);
  }
};

/**
 * @ngdoc function
 * @name notes.functions:createNote
 * @param {Object} data [Note](https://familysearch.org/developers/docs/api/gx/Note_json) data
 * @return {Object} {@link notes.types:constructor.Note Note}
 * @description Create a {@link notes.types:constructor.Note Note} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createNote = function(data){
  return new Note(this, data);
};

Note.prototype = utils.extend(Object.create(FS.BaseClass.prototype), {
  
  constructor: Note,
  
  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#getId
   * @methodOf notes.types:constructor.Note
   * @return {String} Id of the note
   */

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#getSubject
   * @methodOf notes.types:constructor.Note
   * @return {String} subject / title of the note
   */
  getSubject: function() { return this.data.subject; },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#getText
   * @methodOf notes.types:constructor.Note
   * @return {String} text of the note
   */
  getText: function() { return this.data.text; },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#getNoteUrl
   * @methodOf notes.types:constructor.Note
   * @function
   * @return {String} note URL (without the access token)
   */
  getNoteUrl: function() { return this.helpers.removeAccessToken(maybe(this.getLink('note')).href); },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#save
   * @methodOf notes.types:constructor.Note
   * @function
   * @description
   * Create a new note (if this note does not have an id) or update the existing note
   *
   * {@link http://jsfiddle.net/vg1kge0o/1/ Editable Example}
   *
   * @param {string} url url of the notes list endpoint; only necessary when creating a new note
   * @param {string} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the note id, which is fulfilled after the note has been updated,
   * and if refresh is true, after the note has been read.
   */
  save: function(url, changeMessage, opts) {
    var self = this;
    if(!url){
      url = self.getNoteUrl();
    }
    var headers = {};
    var entityType = self.helpers.getEntityType(url);
    if (entityType === 'childAndParentsRelationships') {
      headers['Content-Type'] = 'application/x-fs-v1+json';
    }
    var payload = {};
    payload[entityType] = [ { notes: [ self ] } ];
    if (changeMessage) {
      payload[entityType][0].attribution = self.client.createAttribution(changeMessage);
    }
    return self.plumbing.post(url, payload, headers, opts, function(data, promise) {
      // x-entity-id and location headers are not set on update, only on create
      return self.getNoteUrl() || self.helpers.removeAccessToken(promise.getResponseHeader('Location'));
    });
  },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#delete
   * @methodOf notes.types:constructor.Note
   * @function
   * @description delete this note
   * @param {string=} changeMessage change message
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the note URL
   */
  delete: function(changeMessage, opts) {
    return this.client.deleteNote(this.getNoteUrl(), changeMessage, opts);
  }

});