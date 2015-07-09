var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc function
 * @name notes.types:constructor.Note
 * @description
 *
 * Note
 * To create a new note, you must set subject, text, and either $personId, $childAndParentsId, or $coupleId.
 *
 * @param {Object=} data an object with optional attributes {subject, text, $personId, $childAndParentsId, $coupleId}
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

Note.prototype = {
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
  $getNoteUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).note).href); },

  /**
   * @ngdoc function
   * @name notes.types:constructor.Note#$save
   * @methodOf notes.types:constructor.Note
   * @function
   * @description
   * Create a new note (if this note does not have an id) or update the existing note
   *
   * {@link http://jsfiddle.net/vg1kge0o/1/ Editable Example}
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
    var promise = self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl(template, null, {pid: self.$personId, crid: self.$coupleId, caprid: self.$childAndParentsId, nid: self.id}),
      function(url) {
        var payload = {};
        payload[label] = [ { notes: [ self ] } ];
        if (changeMessage) {
          payload[label][0].attribution = self.$client.createAttribution(changeMessage);
        }
        return self.$plumbing.post(url, payload, headers, opts, function(data, promise) {
          // x-entity-id and location headers are not set on update, only on create
          return {
            id: self.id || promise.getResponseHeader('X-ENTITY-ID'),
            location: self.$getNoteUrl() || self.$helpers.removeAccessToken(promise.getResponseHeader('Location'))
          };
        });
      });
    var returnedPromise = promise.then(function(idLocation) {
      self.$helpers.extendHttpPromise(returnedPromise, promise); // extend the first promise into the returned promise
      if (refresh) {
        // re-read the note and set this object's properties from response
        // we use getPersonNote here to read couple and child-and-parents notes also
        // it's ok to do this since we pass in the full url
        return self.$client.getPersonNote(idLocation.location, null, {}, opts).then(function(response) {
          utils.deletePropertiesPartial(self, utils.appFieldRejector);
          utils.extend(self, response.getNote());
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
      return this.$client.deletePersonNote(this.$getNoteUrl() || this.$personId, this.id, changeMessage, opts);
    }
    else if (this.$coupleId) {
      return this.$client.deleteCoupleNote(this.$getNoteUrl() || this.$coupleId, this.id, changeMessage, opts);
    }
    else {
      return this.$client.deleteChildAndParentsNote(this.$getNoteUrl() || this.$childAndParentsId, this.id, changeMessage, opts);
    }
  }

};