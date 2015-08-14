var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**
 * @ngdoc overview
 * @name notes
 * @description
 * Functions related to notes
 *
 * {@link https://familysearch.org/developers/docs/api/resources#notes FamilySearch API Docs}
 */

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

/**
 * @ngdoc function
 * @name notes.functions:getNote
 * @function
 *
 * @description
 * Get information about a note
 * The response includes the following convenience function
 *
 * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource Person Note API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource Couple Relationship Note API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource Child and Parents Relationship API Docs}
 *
 * {@link http://jsfiddle.net/rcud84ur/1/ Editable Example}
 *
 * @param {string} url full URL of the note
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getNote = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {'Accept': 'application/x-fs-v1+json'}, opts, // child and parents note requires x-fs-v1; others allow fs or gedcomx
    utils.compose(
      utils.objectExtender({getNote: function() {
        return maybe(maybe(getRoot(this)[0]).notes)[0];
      }}),
      function(response){
        var notes = maybe(getRoot(response)[0]).notes;
        utils.forEach(notes, function(note, i){
          notes[i] = self.createNote(note);
        });
        return response;
      }
    ));
};

/**
 * @ngdoc function
 * @name notes.functions:getMultiNote
 * @function
 *
 * @description
 * Get multiple notes at once by requesting them in parallel
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource Person Note API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Note_resource Couple Relationship Note API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Note_resource Child and Parents Relationship API Docs}
 *
 * {@link http://jsfiddle.net/4d1wLp8a/1/ Editable Example}
 *
 * @param {string[]} urls full URLs of the notes
 * @param {Object=} params pass to getNote currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the notes have been read,
 * returning a map of note id or URL to {@link notes.functions:getNote getNote} response
 */
FS.prototype.getMultiNote = function(urls, params, opts) {
  var self = this,
      promises = {};
  utils.forEach(urls, function(u) {
    promises[u] = self.getNote.call(self, u, null, params, opts);
  });
  return this.helpers.promiseAll(promises);
};

/**
 * @ngdoc function
 * @name notes.functions:getNotes
 * @function
 *
 * @description
 * Get notes for a person, couple, or child and parents relationship
 * 
 * The response includes the following convenience function
 *
 * - `getNotes()` - get an array of {@link notes.types:constructor.Note Notes} from the response
 * 
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Notes_resource Person Notes API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Couple_Relationship_Notes_resource Couple Notes API Docs}
 * {@link https://familysearch.org/developers/docs/api/tree/Child-and-Parents_Relationship_Notes_resource Child and Parents Notes API Docs}
 *
 * {@link http://jsfiddle.net/rcud84ur/2/ Editable Example}
 *
 * @param {String} url full URL of the person-notes, couple-notes, or child-and-parents-notes endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getNotes = function(url, params, opts) {
  var self = this;
  return self.plumbing.get(url, params, {}, opts,
    utils.compose(
      utils.objectExtender({getNotes: function() {
        return maybe(getRoot(this)[0]).notes || [];
      }}),
      function(response){
        var notes = maybe(getRoot(response)[0]).notes;
        utils.forEach(notes, function(note, index){
          notes[index] = self.createNote(note);
        });
        return response;
      }
    ));
};

/**
 * @ngdoc function
 * @name notes.functions:deleteNote
 * @function
 *
 * @description
 * Delete the specified person note
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/zxwsxzjr/1/ Editable Example}
 *
 * @param {string} url full URL of the note
 * @param {string=} changeMessage change message
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the url
 */
FS.prototype.deleteNote = function(url, changeMessage, opts) {
  var self = this;
  // x-fs-v1+json is required for child-and-parents notes
  var headers = {'Content-Type': 'application/x-fs-v1+json'};
  if (changeMessage) {
    headers['X-Reason'] = changeMessage;
  }
  return self.plumbing.del(url, headers, opts, function() {
    return url;
  });
};
