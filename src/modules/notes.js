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

FS.prototype._getNote = function(url, params, opts) {
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
      },
      utils.objectExtender(function(response) {
        var label = response.persons ? '$personId' : (response.childAndParentsRelationships ? '$childAndParentsId' : '$coupleId');
        var result = {};
        result[label] = maybe(getRoot(response)[0]).id;
        return result;
      }, function(response) {
        return maybe(getRoot(response)[0]).notes;
      })
    ));
};

FS.prototype._getMultiNote = function(id, nids, params, opts, getNoteFn) {
  var self = this,
      promises = {};
  if (utils.isArray(id)) {
    utils.forEach(id, function(e) {
      promises[e] = getNoteFn.call(self, e, null, params, opts);
    });
  }
  else {
    utils.forEach(nids, function(nid) {
      promises[nid] = getNoteFn.call(self, id, nid, params, opts);
    });
  }
  return promises;
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
 * - `getNote()` - get the {@link notes.types:constructor.Note Note} from the response
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Person_Note_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/rcud84ur/ editable example}
 *
 * @param {string} pid id of the person or full URL of the note
 * @param {string=} nid id of the note (required if pid is the id of the person)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonNote = function(pid, nid, params, opts) {
  // NOTE: this function is called in note.$save() to read couple and child-and-parents notes also by passing in the full note URL
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-note-template', pid, {pid: pid, nid: nid}),
    function(url) {
      return self._getNote(url, params, opts);
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
 * {@link http://jsfiddle.net/4d1wLp8a/ editable example}
 *
 * @param {string|string[]} pid id of the person, or full URLs of the notes
 * @param {string[]=} nids ids of the notes (required if pid is the id of the person)
 * @param {Object=} params pass to getPersonNote currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the notes have been read,
 * returning a map of note id or URL to {@link notes.functions:getPersonNote getPersonNote} response
 */
FS.prototype.getMultiPersonNote = function(pid, nids, params, opts) {
  var promises = this._getMultiNote(pid, nids, params, opts, this.getPersonNote);
  return this.helpers.promiseAll(promises);
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
 * {@link http://jsfiddle.net/khbxwa0u/ editable example}
 *
 * @param {string} crid id of the couple relationship or full URL of the note
 * @param {string=} nid id of the note (required if crid is the id of the couple relationship)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCoupleNote = function(crid, nid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-note-template', crid, {crid: crid, nid: nid}),
    function(url) {
      return self._getNote(url, params, opts);
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
 * {@link http://jsfiddle.net/1Lch860h/ editable example}
 *
 * @param {string|string[]} crid id of the couple relationship, or full URLs of the notes
 * @param {string[]=} nids ids of the notes (required if crid is the id of the couple relationship)
 * @param {Object=} params pass to getCoupleNote currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the notes have been read,
 * returning a map of note id to {@link notes.functions:getCoupleNote getCoupleNote} response
 */
FS.prototype.getMultiCoupleNote = function(crid, nids, params, opts) {
  var promises = this._getMultiNote(crid, nids, params, opts, this.getCoupleNote);
  return this.helpers.promiseAll(promises);
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
 * {@link http://jsfiddle.net/1t1uzgq6/ editable example}
 *
 * @param {string} caprid id of the child and parents relationship or full URL of the note
 * @param {string=} nid id of the note (required if caprid is the id of the child and parents relationship)
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParentsNote = function(caprid, nid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-note-template', caprid, {caprid: caprid, nid: nid}),
    function(url) {
      return self._getNote(url, params, opts);
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
 * {@link http://jsfiddle.net/wp4hecco/ editable example}
 *
 * @param {string|string[]} caprid id of the child and parents relationship, or full URLs of the notes
 * @param {string[]=} nids ids of the notes (required if caprid is the id of the child and parents relationship)
 * @param {Object=} params pass to getChildAndParentsNote currently unused
 * @param {Object=} opts pass to the http function specified during init
 * @return {Object} promise that is fulfilled when all of the notes have been read,
 * returning a map of note id to {@link notes.functions:getChildAndParentsNote getChildAndParentsNote} response
 */
FS.prototype.getMultiChildAndParentsNote = function(caprid, nids, params, opts) {
  var promises = this._getMultiNote(caprid, nids, params, opts, this.getChildAndParentsNote);
  return this.helpers.promiseAll(promises);
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
 * {@link http://jsfiddle.net/rcud84ur/ editable example}
 *
 * @param {String} pid id of the person or full URL of the person-notes endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getPersonNotes = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-notes-template', pid, {pid: pid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getNotes: function() {
            return maybe(maybe(maybe(this).persons)[0]).notes || [];
          }}),
          function(response){
            var notes = maybe(maybe(maybe(response).persons)[0]).notes;
            utils.forEach(notes, function(note, index){
              notes[index] = self.createNote(note);
            });
            return response;
          },
          utils.objectExtender(function(response) {
            return { $personId: maybe(maybe(maybe(response).persons)[0]).id };
          }, function(response) {
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
 * {@link http://jsfiddle.net/khbxwa0u/ editable example}
 *
 * @param {String} crid id of the couple relationship or full URL of the couple-relationship-notes endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getCoupleNotes = function(crid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-notes-template', crid, {crid: crid}),
    function(url) {
      return self.plumbing.get(url, params, {}, opts,
        utils.compose(
          utils.objectExtender({getNotes: function() {
            return maybe(maybe(this.relationships)[0]).notes || [];
          }}),
          function(response){
            var notes = maybe(maybe(maybe(response).relationships)[0]).notes;
            utils.forEach(notes, function(note, index){
              notes[index] = self.createNote(note);
            });
            return response;
          },
          utils.objectExtender(function(response) {
            return { $coupleId: maybe(maybe(maybe(response).relationships)[0]).id };
          }, function(response) {
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
 * {@link http://jsfiddle.net/1t1uzgq6/ editable example}
 *
 * @param {String} caprid id of the child and parents relationship or full URL of the child-and-parents-relationship-notes endpoint
 * @param {Object=} params currently unused
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the response
 */
FS.prototype.getChildAndParentsNotes = function(caprid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-notes-template', caprid, {caprid: caprid}),
    function(url) {
      return self.plumbing.get(url, params,
        {'Accept': 'application/x-fs-v1+json'}, opts,
        utils.compose(
          utils.objectExtender({getNotes: function() {
            return maybe(maybe(this.childAndParentsRelationships)[0]).notes || [];
          }}),
          function(response){
            var notes = maybe(maybe(maybe(response).childAndParentsRelationships)[0]).notes;
            utils.forEach(notes, function(note, index){
              notes[index] = self.createNote(note);
            });
            return response;
          },
          utils.objectExtender(function(response) {
            return { $childAndParentsId: maybe(maybe(maybe(response).childAndParentsRelationships)[0]).id };
          }, function(response) {
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
 * {@link http://jsfiddle.net/zxwsxzjr/ editable example}
 *
 * @param {string} pid person id or full URL of the note
 * @param {string=} nid id of the note (must be set if pid is an id and not the full URL of the note)
 * @param {string=} changeMessage change message
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the pid
 */
FS.prototype.deletePersonNote = function(pid, nid, changeMessage, opts) {
  // this function is called from note.$delete() also to delete couple notes and child-and-parents notes by passing in the full URL
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('person-note-template', pid, {pid: pid, nid: nid}),
    function(url) {
      // need to use x-fs-v1+json, required for child-and-parents notes
      var headers = {'Content-Type': 'application/x-fs-v1+json'};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
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
FS.prototype.deleteCoupleNote = function(crid, nid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('couple-relationship-note-template', crid, {crid: crid, nid: nid}),
    function(url) {
      var headers = {};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
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
FS.prototype.deleteChildAndParentsNote = function(caprid, nid, changeMessage, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('child-and-parents-relationship-note-template', caprid, {caprid: caprid, nid: nid}),
    function(url) {
      var headers = {'Content-Type': 'application/x-fs-v1+json'};
      if (changeMessage) {
        headers['X-Reason'] = changeMessage;
      }
      return self.plumbing.del(url, headers, opts, function() {
        return caprid;
      });
    }
  );
};
