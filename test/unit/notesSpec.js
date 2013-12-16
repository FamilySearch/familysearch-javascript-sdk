define(['FamilySearch'], function(FamilySearch) {
  describe('Note', function() {
    it('references are returned from getPersonNoteRefs', function() {
      FamilySearch.getPersonNoteRefs('P12-3456').then(function(response) {
        var notes = response.getNoteRefs();
        expect(notes[0].id).toBe('1804317705');
        expect(notes[0].subject).toBe('note 0');
        expect(notes[1].id).toBe('1805241226');
        expect(notes[1].subject).toBe('note 1');
      });
    });

    it('is returned from getPersonNote', function() {
      FamilySearch.getPersonNote('12345', '12345').then(function(response) {
        var note = response.getNote();
        expect(note.getNoteId()).toBe('1586334607'); // bad example data
        expect(note.getSubject()).toBe('Sample');
        expect(note.getText()).toBe('Sample note text');
      });
    });

    it('references are returned from getCoupleNoteRefs', function() {
      FamilySearch.getCoupleNoteRefs('R12-3456').then(function(response) {
        var notes = response.getNoteRefs();
        expect(notes.length).toBe(2);
        expect(notes[0].id).toBe('1804317705');
        expect(notes[0].subject).toBe('note 0');
        expect(notes[1].id).toBe('1805241226');
        expect(notes[1].subject).toBe('note 1');
      });
    });

    it('is returned from getCoupleNote', function() {
      FamilySearch.getCoupleNote('MMM7-12S', 'MMMM-ZP8').then(function(response) {
        var note = response.getNote();
        expect(note.getNoteId()).toBe('MMMM-ZP8');
        expect(note.getSubject()).toBe('Couple Relationship Note Title');
        expect(note.getText()).toBe('Couple Relationship Note Text');
        expect(note.getContributorId()).toBe('MMD8-3NT');
      });
    });

    it('references are returned from getChildAndParentsNoteRefs', function() {
      FamilySearch.getChildAndParentsNoteRefs('R12-3456').then(function(response) {
        var notes = response.getNoteRefs();
        expect(notes.length).toBe(2);
        expect(notes[0].id).toBe('1804317705');
        expect(notes[0].subject).toBe('note 0');
        expect(notes[1].id).toBe('1805241226');
        expect(notes[1].subject).toBe('note 1');
      });
    });

    it('is returned from getChildAndParentsNote', function() {
      FamilySearch.getChildAndParentsNote('RRRX-RRX', 'NOTE1').then(function(response) {
        var note = response.getNote();
        expect(note.getNoteId()).toBeUndefined(); // bad example data
        expect(note.getSubject()).toBe('Sample');
        expect(note.getText()).toBe('Sample note text');
        expect(note.getContributorId()).toBeUndefined();
      });
    });
  });
});