describe('base class', function() {
  
  it('serializes', function(){
    var person = FS.createPerson({
      gender: 'Male',
      names: [
        {
          givenName: 'Gustaf'
        }
      ]
    });
    var expectedJson = {
      names: [ {
        nameForms: [ {
          parts: [ {
            type: 'http://gedcomx.org/Given',
            value: 'Gustaf'
          } ]
        } ],
        preferred: false
      } ],
      gender: {
        type: 'Male',
      }
    };
    expect(person.toJSON()).toEqualJson(expectedJson);
    expect(JSON.parse(person.toString())).toEqualJson(expectedJson);
  });
  
  it('getLinkPromise success', function(done){
    var person = FS.createPerson({
      links: {
        test: {
          href: 'foobaz'
        }
      }
    });
    person.testMethod = function(){
      this.getLinkPromise('test').then(function(link){
        expect(link.href).toEqual('foobaz');
        done();
      });
    };
    person.testMethod();
  });
  
  it('getLinkPromise failure', function(done){
    var person = FS.createPerson();
    person.testMethod = function(){
      return this.getLinkPromise('test').then(function(link){
        return link;
      });
    };
    person.testMethod().then(null, function(error){
      expect(error.message).toEqual('Missing link: test');
      done();
    });
  });
  
  it('toJSON handle undefined values', function(){
    var base = new FamilySearch.BaseClass(FS, {
      a: 'a',
      b: undefined
    });
    expect(JSON.stringify(base)).toEqualJson({
      a: 'a'
    });
  });
  
});