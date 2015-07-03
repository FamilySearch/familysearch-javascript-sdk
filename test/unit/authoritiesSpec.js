describe('Authorities', function() {
  
  it('standardizes dates', function(done) {
    FS.getDate('8 Mar 2006').then(function(response) {
      expect(response.getDate().normalized).toBe('8 March 2006');
      expect(response.getDate().$getFormalDate()).toBe('+2006-03-08');
      done();
    });
  });

  it('formalizes dates', function() {
    var date = FS.createDate();
    date.normalized = '4 March 2006 / 16 December 2007';
    expect(date.$getFormalDate()).toBe('+2006-03-04');
    date.normalized = 'FROM 4 March 2006 TO 16 December 2007';
    expect(date.$getFormalDate()).toBe('+2006-03-04/+2007-12-16');
    date.normalized = 'before 10 March 2006';
    expect(date.$getFormalDate()).toBe('A/+2006-03-10');
    date.normalized = 'about 8 December 2006';
    expect(date.$getFormalDate()).toBe('A+2006-12-08');
    date.normalized = 'after 8 March 2006';
    expect(date.$getFormalDate()).toBe('A+2006-03-08/');
    date.normalized = '8 March 0206 BC';
    expect(date.$getFormalDate()).toBe('-0206-03-08');
  });

});
