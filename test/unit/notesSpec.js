describe('Note', function() {
  
  it('handles empty response from getNotes', function(done){
    var promise = FS.getNotes('https://familysearch.org/platform/tree/persons/P12-8975/notes');
    promise.then(function(response){
      expect(response.getNotes().length).toBe(0);
      expect(promise.getStatusCode()).toBe(204);
      done();
    });
  });
  
  it('notes are returned from getNotes for a person', function(done) {
    FS.getNotes('https://familysearch.org/platform/tree/persons/P12-3456/notes').then(function(response) {
      var notes = response.getNotes();
      expect(notes.length).toBe(2);
      expect(notes[0].getId()).toBe('1804317705');
      expect(notes[0].getSubject()).toBe('note 0');
      expect(notes[0].getNoteUrl()).toBe('https://familysearch.org/platform/tree/persons/P12-3456/notes/1804317705');
      expect(notes[0].getText()).toBe('Sample note text');
      expect(notes[0].getAttribution().getAgentId()).toBe('MMD8-3NT');
      expect(notes[1].getId()).toBe('1805241226');
      expect(notes[1].getSubject()).toBe('note 1');
      done();
    });
  });

  it('is returned from getNote for a person', function(done) {
    FS.getNote('https://familysearch.org/platform/tree/persons/P12-3456/notes/1804317705').then(function(response) {
      var note = response.getNote();
      expect(note.getId()).toBe('1804317705');
      expect(note.getSubject()).toBe('Sample');
      expect(note.getText()).toBe('Sample note text');
      expect(note.getAttribution()).toBeUndefined();
      done();
    });
  });

  it('are returned from getMultiNote for a person', function(done) {
    FS.getMultiNote(['https://familysearch.org/platform/tree/persons/P12-3456/notes/1804317705']).then(function(response) {
      var note = response['https://familysearch.org/platform/tree/persons/P12-3456/notes/1804317705'].getNote();
      expect(note.getId()).toBe('1804317705');
      done();
    });
  });
  
  it('handles empty response from getNotes for a couple', function(done){
    var promise = FS.getNotes('https://familysearch.org/platform/tree/couple-relationships/789456/notes');
    promise.then(function(response){
      expect(promise.getStatusCode()).toBe(204);
      expect(response.getNotes().length).toBe(0);
      done();
    });
  });

  it('notes are returned from getNotes for a couple', function(done) {
    FS.getNotes('https://familysearch.org/platform/tree/couple-relationships/12345/notes').then(function(response) {
      var notes = response.getNotes();
      expect(notes.length).toBe(2);
      expect(notes[0].getId()).toBe('1804317705');
      expect(notes[0].getSubject()).toBe('note 0');
      expect(notes[0].getAttribution().getAgentId()).toBe('MMD8-3NT');
      expect(notes[1].getId()).toBe('1805241226');
      expect(notes[1].getSubject()).toBe('note 1');
      done();
    });
  });

  it('is returned from getNote for a couple', function(done) {
    FS.getNote('https://familysearch.org/platform/tree/couple-relationships/12345/notes/MMMM-ZP8').then(function(response) {
      var note = response.getNote();
      expect(note.getId()).toBe('MMMM-ZP8');
      expect(note.getSubject()).toBe('Couple Relationship Note Title');
      expect(note.getText()).toBe('Couple Relationship Note Text');
      expect(note.getAttribution().getAgentId()).toBe('MMD8-3NT');
      expect(note.getAttribution().getModifiedTimestamp()).toBe(1387223690000);
      done();
    });
  });

  it('are returned from getMultiNote for a couple', function(done) {
    FS.getMultiNote(['https://familysearch.org/platform/tree/couple-relationships/12345/notes/MMMM-ZP8']).then(function(response) {
      var note = response['https://familysearch.org/platform/tree/couple-relationships/12345/notes/MMMM-ZP8'].getNote();
      expect(note.getId()).toBe('MMMM-ZP8');
      done();
    });
  });
  
  it('handles empty response from getNotes for a child and parents', function(done){
    var promise = FS.getNotes('https://familysearch.org/platform/tree/child-and-parents-relationships/123456/notes');
    promise.then(function(response){
      expect(promise.getStatusCode()).toBe(204);
      expect(response.getNotes().length).toBe(0);
      done();
    });
  });

  it('notes are returned from getNotes for a child and parents', function(done) {
    FS.getNotes('https://familysearch.org/platform/tree/child-and-parents-relationships/PPPX-PP0/notes').then(function(response) {
      var notes = response.getNotes();
      expect(notes.length).toBe(2);
      expect(notes[0].getId()).toBe('1804317705');
      expect(notes[0].getSubject()).toBe('note 0');
      expect(notes[0].getAttribution().getAgentId()).toBe('MMD8-3NT');
      expect(notes[1].getId()).toBe('1805241226');
      expect(notes[1].getSubject()).toBe('note 1');
      done();
    });
  });

  it('is returned from getNote for a child and parents', function(done) {
    FS.getNote('https://familysearch.org/platform/tree/child-and-parents-relationships/RRRX-RRX/notes/NOTE1').then(function(response) {
      var note = response.getNote();
      expect(note.getId()).toBe('NOTE1');
      expect(note.getSubject()).toBe('Sample');
      expect(note.getText()).toBe('Sample note text');
      expect(note.getAttribution()).toBeUndefined();
      done();
    });
  });

  it('are returned from getMultiNote for a child and parents', function(done) {
    FS.getMultiNote(['https://familysearch.org/platform/tree/child-and-parents-relationships/RRRX-RRX/notes/NOTE1']).then(function(response) {
      var note = response['https://familysearch.org/platform/tree/child-and-parents-relationships/RRRX-RRX/notes/NOTE1'].getNote();
      expect(note.getSubject()).toBe('Sample');
      done();
    });
  });

  it('is created (person note)', function(done) {
    var promise = FS.createNote({subject: 'Sample', text: 'Sample note text.'})
      .save('https://familysearch.org/platform/tree/persons/P12-3456/notes', 'change message');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'persons' : [ {
          'notes' : [ {
            'subject' : 'Sample',
            'text' : 'Sample note text.'
          } ],
          'attribution' : {
            'changeMessage' : 'change message'
          }
        } ]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('https://familysearch.org/platform/tree/persons/P12-3456/notes/1');
      done();
    });
  });

  it('is updated (person note)', function(done) {
    var note = FS.createNote({subject: 'Sample', text: 'Sample note text'});
    note.setId('1804317705');
    note.addLink('note', {href: 'https://sandbox.familysearch.org/platform/tree/persons/P12-3456/notes/1804317705'});
    var promise = note.save(null, 'change message');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'persons' : [ {
          'notes' : [ {
            'subject' : 'Sample',
            'text' : 'Sample note text',
            'id' : '1804317705',
            'links' : {
              'note' : {
                'href' : 'https://sandbox.familysearch.org/platform/tree/persons/P12-3456/notes/1804317705'
              }
            }
          } ],
          'attribution' : {
            'changeMessage' : 'change message'
          }
        } ]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://sandbox.familysearch.org/platform/tree/persons/P12-3456/notes/1804317705');
      done();
    });
  });

  it('is deleted (person note)', function(done) {
    var promise = FS.deleteNote('https://familysearch.org/platform/tree/persons/P12-3456/notes/12345');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://familysearch.org/platform/tree/persons/P12-3456/notes/12345');
      done();
    });
  });

  it('is created (couple note)', function(done) {
    var promise = FS.createNote({subject: 'Sample', text: 'Sample note text.'})
      .save('https://familysearch.org/platform/tree/couple-relationships/R12-3456/notes', 'change message');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'relationships' : [ {
          'notes' : [ {
            'subject' : 'Sample',
            'text' : 'Sample note text.'
          } ],
          'attribution' : {
            'changeMessage' : 'change message'
          }
        } ]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('https://familysearch.org/platform/tree/couple-relationships/R12-3456/notes/1');
      done();
    });
  });

  it('is updated (couple note)', function(done) {
    var note = FS.createNote({subject: 'Sample', text: 'Sample note text'});
    note.setId('MMMM-ZP8');
    note.addLink('note', {href: 'https://sandbox.familysearch.org/platform/tree/couple-relationships/12345/notes/MMMM-ZP8'});
    var promise = note.save(null, 'change message');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'relationships' : [ {
          'notes' : [ {
            'subject' : 'Sample',
            'text' : 'Sample note text',
            'id' : 'MMMM-ZP8',
            'links' : {
              'note' : {
                'href' : 'https://sandbox.familysearch.org/platform/tree/couple-relationships/12345/notes/MMMM-ZP8'
              }
            }
          } ],
          'attribution' : {
            'changeMessage' : 'change message'
          }
        } ]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://sandbox.familysearch.org/platform/tree/couple-relationships/12345/notes/MMMM-ZP8');
      done();
    });
  });

  it('is deleted (couple note)', function(done) {
    var promise = FS.deleteNote('https://sandbox.familysearch.org/platform/tree/couple-relationships/R12-3456/notes/12345');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://sandbox.familysearch.org/platform/tree/couple-relationships/R12-3456/notes/12345');
      done();
    });
  });

  it('is created (child-and-parents note)', function(done) {
    var promise = FS.createNote({subject: 'Sample', text: 'Sample note text.'})
      .save('https://familysearch.org/platform/tree/child-and-parents-relationships/R12-3456/notes', 'change message');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'childAndParentsRelationships' : [ {
          'notes' : [ {
            'subject' : 'Sample',
            'text' : 'Sample note text.'
          } ],
          'attribution' : {
            'changeMessage' : 'change message'
          }
        } ]
      });
      expect(promise.getStatusCode()).toBe(201);
      expect(response).toBe('https://familysearch.org/platform/tree/child-and-parents-relationships/R12-3456/notes/1');
      done();
    });
  });

  it('is updated (cihld-and-parents note)', function(done) {
    var note = FS.createNote({subject: 'Sample', text: 'Sample note text'});
    note.setId('NOTE1');
    note.addLink('note', {href: 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/RRRX-RRX/notes/NOTE1'});
    var promise = note.save(null, 'change message');
    promise.then(function(response) {
      var request = promise.getRequest();
      //noinspection JSUnresolvedFunction
      expect(request.body).toEqualJson({
        'childAndParentsRelationships' : [ {
          'notes' : [ {
            'subject' : 'Sample',
            'text' : 'Sample note text',
            'id' : 'NOTE1',
            'links' : {
              'note' : {
                'href' : 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/RRRX-RRX/notes/NOTE1'
              }
            }
          } ],
          'attribution' : {
            'changeMessage' : 'change message'
          }
        } ]
      });
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/RRRX-RRX/notes/NOTE1');
      done();
    });
  });

  it('is deleted (child-and-parents note)', function(done) {
    var promise = FS.deleteNote('https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/RRRX-RRX/notes/NOTE1');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/RRRX-RRX/notes/NOTE1');
      done();
    });
  });

});
