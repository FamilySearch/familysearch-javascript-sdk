define([
  'init',
  'authentication',
  'changeHistory',
  'discussions',
  'memories',
  'notes',
  'parentsAndChildren',
  'pedigree',
  'person',
  'searchAndMatch',
  'sourceBox',
  'sources',
  'spouses',
  'user',
  'plumbing'
], function(init, authentication, changeHistory, discussions, memories, notes, parentsAndChildren, pedigree, person,
            searchAndMatch, sourceBox, sources, spouses, user, plumbing) {
  return {
    init: init.init,

    // authentication
    getAuthCode: authentication.getAuthCode,
    getAccessToken: authentication.getAccessToken,
    hasAccessToken: authentication.hasAccessToken,
    invalidateAccessToken: authentication.invalidateAccessToken,

    // changeHistory
    getPersonChangeHistory: changeHistory.getPersonChangeHistory,
    getChildAndParentsChangeHistory: changeHistory.getChildAndParentsChangeHistory,
    getCoupleChangeHistory: changeHistory.getCoupleChangeHistory,

    // discussions
    getPersonDiscussionReferences: discussions.getPersonDiscussionReferences,
    getDiscussion: discussions.getDiscussion,
    getComments: discussions.getComments,

    // memories
    getPersonMemoryReferences: memories.getPersonMemoryReferences,
    getMemory: memories.getMemory,
    getMemoryComments: memories.getMemoryComments,
    getMemoryPersonas: memories.getMemoryPersonas,
    getPersonPortraitURL: memories.getPersonPortraitURL,
    getPersonMemories: memories.getPersonMemories,
    getUserMemories: memories.getUserMemories,

    // notes
    getPersonNotes: notes.getPersonNotes,
    getPersonNote: notes.getPersonNote,
    getCoupleNotes: notes.getCoupleNotes,
    getCoupleNote: notes.getCoupleNote,
    getChildAndParentsNotes: notes.getChildAndParentsNotes,

    // parents and children
    getChildAndParents: parentsAndChildren.getChildAndParents,

    // pedigree
    getAncestry: pedigree.getAncestry,
    getDescendancy: pedigree.getDescendancy,

    // person
    getPerson: person.getPerson,
    getMultiPerson: person.getMultiPerson,
    getPersonWithRelationships: person.getPersonWithRelationships,
    getPersonChangeSummary: person.getPersonChangeSummary,
    getRelationshipsToSpouses: person.getRelationshipsToSpouses,
    getRelationshipsToParents: person.getRelationshipsToParents,
    getRelationshipsToChildren: person.getRelationshipsToChildren,

    // search and match
    getPersonSearch: searchAndMatch.getPersonSearch,
    getPersonMatches: searchAndMatch.getPersonMatches,
    getPersonMatchesQuery: searchAndMatch.getPersonMatchesQuery,

    // sourceBox
    getCollectionsForUser: sourceBox.getCollectionsForUser,
    getCollection: sourceBox.getCollection,
    getCollectionSourceDescriptions: sourceBox.getCollectionSourceDescriptions,
    getCollectionSourceDescriptionsForUser: sourceBox.getCollectionSourceDescriptionsForUser,

    // sources
    getPersonSourceReferences: sources.getPersonSourceReferences,
    getSourceDescription: sources.getSourceDescription,

    // spouses
    getCouple: spouses.getCouple,

    // user
    getCurrentUser: user.getCurrentUser,
    getCurrentUserPerson: user.getCurrentUserPerson,
    getAgent: user.getAgent,

    // plumbing
    get: plumbing.get,
    post: plumbing.post,
    put: plumbing.put,
    del: plumbing.del,
    http: plumbing.http,
    getTotalProcessingTime: plumbing.getTotalProcessingTime,
    setTotalProcessingTime: plumbing.setTotalProcessingTime
  };
});