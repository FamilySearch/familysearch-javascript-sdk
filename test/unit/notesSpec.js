describe('Note', function() {
  it('notes are returned from getPersonNotes', function(done) {
    FS.getPersonNotes('P12-3456').then(function(response) {
      var notes = response.getNotes();
      expect(notes[0].id).toBe('1804317705');
      expect(notes[0].subject).toBe('note 0');
      expect(notes[0].$personId).toBe('P12-3456');
      expect(notes[0].$getNoteUrl()).toBe('https://familysearch.org/platform/tree/persons/P12-3456/notes/1804317705');
      expect(notes[0].text).toBe('Sample note text');
      expect(notes[0].attribution.$getAgentId()).toBe('MMD8-3NT');
      expect(notes[1].id).toBe('1805241226');
      expect(notes[1].subject).toBe('note 1');
      expect(notes[1].$personId).toBe('P12-3456');
      done();
    });
  });

  it('is returned from getPersonNote', function(done) {
    FS.getPersonNote('12345', '12345').then(function(response) {
      var note = response.getNote();
      expect(note.id).toBe('1586334607'); // bad example data
      expect(note.subject).toBe('Sample');
      expect(note.text).toBe('Sample note text');
      expect(note.$personId).toBe('12345');
      expect(note.attribution).toBeUndefined(); // bad example data
      done();
    });
  });

  it('are returned from getMultiPersonNote', function(done) {
    FS.getMultiPersonNote('12345', ['12345']).then(function(response) {
      var note = response['12345'].getNote();
      expect(note.id).toBe('1586334607'); // bad example data
      done();
    });
  });

  it('notes are returned from getCoupleNotes', function(done) {
    FS.getCoupleNotes('12345').then(function(response) {
      var notes = response.getNotes();
      expect(notes.length).toBe(2);
      expect(notes[0].id).toBe('1804317705');
      expect(notes[0].subject).toBe('note 0');
      expect(notes[0].$coupleId).toBe('12345');
      expect(notes[0].attribution.$getAgentId()).toBe('MMD8-3NT');
      expect(notes[1].id).toBe('1805241226');
      expect(notes[1].subject).toBe('note 1');
      expect(notes[1].$coupleId).toBe('12345');
      done();
    });
  });

  it('is returned from getCoupleNote', function(done) {
    FS.getCoupleNote('12345', 'MMMM-ZP8').then(function(response) {
      var note = response.getNote();
      expect(note.id).toBe('MMMM-ZP8');
      expect(note.subject).toBe('Couple Relationship Note Title');
      expect(note.text).toBe('Couple Relationship Note Text');
      expect(note.$coupleId).toBe('12345');
      expect(note.attribution.$getAgentId()).toBe('MMD8-3NT');
      expect(note.attribution.modified).toBe(1387223690000);
      done();
    });
  });

  it('are returned from getMultiCoupleNote', function(done) {
    FS.getMultiCoupleNote('12345', ['MMMM-ZP8']).then(function(response) {
      var note = response['MMMM-ZP8'].getNote();
      expect(note.id).toBe('MMMM-ZP8');
      done();
    });
  });

  it('notes are returned from getChildAndParentsNotes', function(done) {
    FS.getChildAndParentsNotes('PPPX-PP0').then(function(response) {
      var notes = response.getNotes();
      expect(notes.length).toBe(2);
      expect(notes[0].id).toBe('1804317705');
      expect(notes[0].subject).toBe('note 0');
      expect(notes[0].$childAndParentsId).toBe('PPPX-PP0');
      expect(notes[0].attribution.$getAgentId()).toBe('MMD8-3NT');
      expect(notes[1].id).toBe('1805241226');
      expect(notes[1].subject).toBe('note 1');
      expect(notes[1].$childAndParentsId).toBe('PPPX-PP0');
      done();
    });
  });

  it('is returned from getChildAndParentsNote', function(done) {
    FS.getChildAndParentsNote('RRRX-RRX', 'NOTE1').then(function(response) {
      var note = response.getNote();
      expect(note.id).toBeUndefined(); // bad example data
      expect(note.subject).toBe('Sample');
      expect(note.text).toBe('Sample note text');
      expect(note.$childAndParentsId).toBe('RRRX-RRX');
      expect(note.attribution).toBeUndefined(); // bad example data
      done();
    });
  });

  it('are returned from getMultiChildAndParentsNote', function(done) {
    FS.getMultiChildAndParentsNote('RRRX-RRX', ['NOTE1']).then(function(response) {
      var note = response['NOTE1'].getNote();
      expect(note.subject).toBe('Sample');
      done();
    });
  });

  it('is created (person note)', function(done) {
    var promise = FS.createNote({subject: 'Sample', text: 'Sample note text.', $personId: 'P12-3456'})
      .$save('change message');
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
      expect(response).toBe('1');
      done();
    });
  });

  it('is updated (person note)', function(done) {
    var note = FS.createNote({subject: 'Sample', text: 'Sample note text', $personId: 'P12-3456'});
    note.id = '1804317705';
    note.links = {note: {href: 'https://sandbox.familysearch.org/platform/tree/persons/P12-3456/notes/1804317705'}};
    var promise = note.$save('change message', true);
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
      expect(note.links.notes).toBeTruthy(); // refresh from db
      expect(response).toBe('1804317705');
      done();
    });
  });

  it('is deleted (person note)', function(done) {
    var promise = FS.deletePersonNote('P12-3456', '12345');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('P12-3456');
      done();
    });
  });

  it('is created (couple note)', function(done) {
    var promise = FS.createNote({subject: 'Sample', text: 'Sample note text.', $coupleId: 'R12-3456'})
      .$save('change message');
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
      expect(response).toBe('1');
      done();
    });
  });

  it('is updated (couple note)', function(done) {
    var note = FS.createNote({subject: 'Sample', text: 'Sample note text', $coupleId: '12345'});
    note.id = 'MMMM-ZP8';
    note.links = {note: {href: 'https://sandbox.familysearch.org/platform/tree/couple-relationships/12345/notes/MMMM-ZP8'}};
    var promise = note.$save('change message', true);
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
      expect(note.links.notes).toBeTruthy(); // refresh from db
      expect(response).toBe('MMMM-ZP8');
      done();
    });
  });

  it('is deleted (couple note)', function(done) {
    var promise = FS.deleteCoupleNote('R12-3456', '12345');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('R12-3456');
      done();
    });
  });

  it('is created (child-and-parents note)', function(done) {
    var promise = FS.createNote({subject: 'Sample', text: 'Sample note text.', $childAndParentsId: 'R12-3456'})
      .$save('change message');
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
      expect(response).toBe('1');
      done();
    });
  });

  it('is updated (cihld-and-parents note)', function(done) {
    var note = FS.createNote({subject: 'Sample', text: 'Sample note text', $childAndParentsId: 'RRRX-RRX'});
    note.id = 'NOTE1';
    note.links = {note: {href: 'https://sandbox.familysearch.org/platform/tree/child-and-parents-relationships/RRRX-RRX/notes/NOTE1'}};
    var promise = note.$save('change message', true);
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
      expect(note.links.notes).toBeTruthy(); // refresh from db
      expect(response).toBe('NOTE1');
      done();
    });
  });

  it('is deleted (child-and-parents note)', function(done) {
    var promise = FS.deleteChildAndParentsNote('RRRX-RRX', 'NOTE1');
    promise.then(function(response) {
      expect(promise.getStatusCode()).toBe(204);
      expect(response).toBe('RRRX-RRX');
      done();
    });
  });

});
