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
  });
});