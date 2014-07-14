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

  return {
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
    restoreChange: changeHistory.restoreChange,

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
    getPersonNotes: notes.getPersonNotes,
    getPersonNote: notes.getPersonNote,
    getMultiPersonNote: notes.getMultiPersonNote,
    getCoupleNotes: notes.getCoupleNotes,
    getCoupleNote: notes.getCoupleNote,
    getMultiCoupleNote: notes.getMultiCoupleNote,
    getChildAndParentsNotes: notes.getChildAndParentsNotes,
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
    //getPersonChangeSummary: person.getPersonChangeSummary, -- REST API broken
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
    getPersonSourcesQuery: sources.getPersonSourcesQuery,
    getSourceDescription: sources.getSourceDescription,
    getMultiSourceDescription: sources.getMultiSourceDescription,
    getCoupleSourceRefs: sources.getCoupleSourceRefs,
    getCoupleSourcesQuery: sources.getCoupleSourcesQuery,
    getChildAndParentsSourceRefs: sources.getChildAndParentsSourceRefs,
    getChildAndParentsSourcesQuery: sources.getChildAndParentsSourcesQuery,
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
    getAgent: user.getAgent,
    getMultiAgent: user.getMultiAgent,

    // utilities
    getRedirectUrl: utilities.getRedirectUrl
  };
});