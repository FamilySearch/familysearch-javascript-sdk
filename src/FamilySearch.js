define([
  'init',
  'authentication',
  'authorities',
  'changeHistory',
  'discussions',
  'fact',
  'helpers',
  'memories',
  'name',
  'notes',
  'parentsAndChildren',
  'pedigree',
  'person',
  'plumbing',
  'searchAndMatch',
  'sourceBox',
  'sources',
  'spouses',
  'user',
  'utilities'
], function(init, authentication, authorities, changeHistory, discussions, fact, helpers, memories, name, notes,
            parentsAndChildren, pedigree, person, plumbing, searchAndMatch, sourceBox, sources, spouses, user, utilities) {

  var Foo = function(params) {
    //noinspection JSPotentiallyInvalidUsageOfThis
    this.params = params;

    this.getAccessToken = helpers.partial(authentication.getAccessToken, this.params);
    this.getCurrentUser = helpers.partial(user.getCurrentUser, this.params);
    this.Fact = function(data) { return new fact.Fact(this.params, data); };
    this.createFact = function(data) { return new fact.Fact(this.params, data); };
  };

  return {
    Foo: Foo,
    init: init.init,

    // authentication
    getAuthCode: authentication.getAuthCode,
    getAccessToken: authentication.getAccessToken,
    getAccessTokenForMobile: authentication.getAccessTokenForMobile,
    hasAccessToken: authentication.hasAccessToken,
    invalidateAccessToken: authentication.invalidateAccessToken,

    // authorities
    Date: authorities.Date,
    Place: authorities.Place,
    getDate: authorities.getDate,
    getPlaceSearch: authorities.getPlaceSearch,

    // changeHistory
    Change: changeHistory.Change,
    getPersonChanges: changeHistory.getPersonChanges,
    getChildAndParentsChanges: changeHistory.getChildAndParentsChanges,
    getCoupleChanges: changeHistory.getCoupleChanges,

    // TODO discovery

    // discussions
    Discussion: discussions.Discussion,
    DiscussionRef: discussions.DiscussionRef,
    Comment: discussions.Comment,
    getPersonDiscussionRefs: discussions.getPersonDiscussionRefs,
    getDiscussion: discussions.getDiscussion,
    getMultiDiscussion: discussions.getMultiDiscussion,
    getDiscussionComments: discussions.getDiscussionComments,
    deleteDiscussion: discussions.deleteDiscussion,
    deleteDiscussionRef: discussions.deleteDiscussionRef,
    deleteDiscussionComment: discussions.deleteDiscussionComment,
    deleteMemoryComment: discussions.deleteMemoryComment,

    // fact
    Fact: fact.Fact,

    // memories
    Memory: memories.Memory,
    MemoryPersona: memories.MemoryPersona,
    MemoryPersonaRef: memories.MemoryPersonaRef,
    MemoryArtifactRef: memories.MemoryArtifactRef,
    getMemoryPersonaRefs: memories.getMemoryPersonaRefs,
    getMemory: memories.getMemory,
    getMemoryComments: memories.getMemoryComments,
    getMemoryPersonas: memories.getMemoryPersonas,
    getMemoryPersona: memories.getMemoryPersona,
    getPersonPortraitUrl: memories.getPersonPortraitUrl,
    getPersonMemoriesQuery: memories.getPersonMemoriesQuery,
    getUserMemoriesQuery: memories.getUserMemoriesQuery,
    deleteMemory: memories.deleteMemory,
    deleteMemoryPersona: memories.deleteMemoryPersona,
    deleteMemoryPersonaRef: memories.deleteMemoryPersonaRef,

    // name
    Name: name.Name,

    // notes
    Note: notes.Note,
    NoteRef: notes.NoteRef,
    getPersonNoteRefs: notes.getPersonNoteRefs,
    getPersonNote: notes.getPersonNote,
    getMultiPersonNote: notes.getMultiPersonNote,
    getCoupleNoteRefs: notes.getCoupleNoteRefs,
    getCoupleNote: notes.getCoupleNote,
    getMultiCoupleNote: notes.getMultiCoupleNote,
    getChildAndParentsNoteRefs: notes.getChildAndParentsNoteRefs,
    getChildAndParentsNote: notes.getChildAndParentsNote,
    getMultiChildAndParentsNote: notes.getMultiChildAndParentsNote,
    deletePersonNote: notes.deletePersonNote,
    deleteCoupleNote: notes.deleteCoupleNote,
    deleteChildAndParentsNote: notes.deleteChildAndParentsNote,

    // TODO ordinances

    // parents and children
    ChildAndParents: parentsAndChildren.ChildAndParents,
    deleteChildAndParents: parentsAndChildren.deleteChildAndParents,
    getChildAndParents: parentsAndChildren.getChildAndParents,

    // pedigree
    getAncestry: pedigree.getAncestry,
    getDescendancy: pedigree.getDescendancy,

    // person
    Person: person.Person,
    deletePerson: person.deletePerson,
    getPerson: person.getPerson,
    getMultiPerson: person.getMultiPerson,
    getPersonWithRelationships: person.getPersonWithRelationships,
    getPersonChangeSummary: person.getPersonChangeSummary,
    getSpouses: person.getSpouses,
    getParents: person.getParents,
    getChildren: person.getChildren,
    getPreferredSpouse: person.getPreferredSpouse,
    setPreferredSpouse: person.setPreferredSpouse,
    deletePreferredSpouse: person.deletePreferredSpouse,
    getPreferredParents: person.getPreferredParents,
    setPreferredParents: person.setPreferredParents,
    deletePreferredParents: person.deletePreferredParents,

    // TODO places

    // plumbing
    get: plumbing.get,
    post: plumbing.post,
    put: plumbing.put,
    del: plumbing.del,
    http: plumbing.http,
    getTotalProcessingTime: plumbing.getTotalProcessingTime,
    setTotalProcessingTime: plumbing.setTotalProcessingTime,

    // search and match
    SearchResult: searchAndMatch.SearchResult,
    getPersonSearch: searchAndMatch.getPersonSearch,
    getPersonMatches: searchAndMatch.getPersonMatches,
    getPersonMatchesQuery: searchAndMatch.getPersonMatchesQuery,

    // sourceBox
    Collection: sourceBox.Collection,
    getCollectionsForUser: sourceBox.getCollectionsForUser,
    getCollection: sourceBox.getCollection,
    getCollectionSourceDescriptions: sourceBox.getCollectionSourceDescriptions,
    getCollectionSourceDescriptionsForUser: sourceBox.getCollectionSourceDescriptionsForUser,
    moveSourceDescriptionsToCollection: sourceBox.moveSourceDescriptionsToCollection,
    removeSourceDescriptionsFromCollections: sourceBox.removeSourceDescriptionsFromCollections,
    deleteCollection: sourceBox.deleteCollection,

    // sources
    SourceDescription: sources.SourceDescription,
    SourceRef: sources.SourceRef,
    getPersonSourceRefs: sources.getPersonSourceRefs,
    getSourceDescription: sources.getSourceDescription,
    getMultiSourceDescription: sources.getMultiSourceDescription,
    getCoupleSourceRefs: sources.getCoupleSourceRefs,
    getChildAndParentsSourceRefs: sources.getChildAndParentsSourceRefs,
    getSourceRefsQuery: sources.getSourceRefsQuery,
    deleteSourceDescription: sources.deleteSourceDescription,
    deletePersonSourceRef: sources.deletePersonSourceRef,
    deleteCoupleSourceRef: sources.deleteCoupleSourceRef,
    deleteChildAndParentsSourceRef: sources.deleteChildAndParentsSourceRef,

    // spouses
    Couple: spouses.Couple,
    deleteCouple: spouses.deleteCouple,
    getCouple: spouses.getCouple,

    // user
    Agent: user.Agent,
    User: user.User,
    getCurrentUser: user.getCurrentUser,
    getCurrentUserPersonId: user.getCurrentUserPersonId,
    getAgent: user.getAgent,
    getMultiAgent: user.getMultiAgent,

    // utilities
    getRedirectUrl: utilities.getRedirectUrl
  };
});