define(['FamilySearch'], function(FamilySearch) {
  describe('Note', function() {
    it('references are returned from getPersonNotes', function() {
      FamilySearch.getPersonNotes('P12-3456').then(function(response) {
        var notes = response.getNotes();
        expect(notes[0].id).toBe('1804317705');
        expect(notes[0].subject).toBe('note 0');
        expect(notes[1].id).toBe('1805241226');
        expect(notes[1].subject).toBe('note 1');
      });
    });

    it('is returned from getPersonNote', function() {
      FamilySearch.getPersonNote('12345', '12345').then(function(response) {
        expect(response.getPersonId()).toBe('12345');
        expect(response.getNoteId()).toBe('1586334607');
        expect(response.getSubject()).toBe('Sample');
        expect(response.getText()).toBe('Sample note text');
      });
    });

    it('references are returned from getCoupleNotes', function() {
      FamilySearch.getCoupleNotes('R12-3456').then(function(response) {
        var notes = response.getNotes();
        expect(notes.length).toBe(2);
        expect(notes[0].id).toBe('1804317705');
        expect(notes[0].subject).toBe('note 0');
        expect(notes[1].id).toBe('1805241226');
        expect(notes[1].subject).toBe('note 1');
      });
    });

  });
});