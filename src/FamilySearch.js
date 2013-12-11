define([
  'init',
  'authentication',
  'changeHistory',
  'discussions',
  'memories',
  'notes',
  'pedigree',
  'person',
  'searchAndMatch',
  'sources',
  'user',
  'plumbing'
], function(init, authentication, changeHistory, discussions, memories, notes, pedigree, person, searchAndMatch, sources, user, plumbing) {
  return {
    init: init.init,

    // authentication
    getAuthCode: authentication.getAuthCode,
    getAccessToken: authentication.getAccessToken,
    hasAccessToken: authentication.hasAccessToken,
    invalidateAccessToken: authentication.invalidateAccessToken,

    // changeHistory
    getPersonChangeHistory: changeHistory.getPersonChangeHistory,

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

    // pedigree
    getAncestry: pedigree.getAncestry,
    getDescendancy: pedigree.getDescendancy,

    // person
    getPerson: person.getPerson,
    getMultiPerson: person.getMultiPerson,
    getPersonWithRelationships: person.getPersonWithRelationships,
    getPersonChangeSummary: person.getPersonChangeSummary,

    // search and match
    getPersonSearch: searchAndMatch.getPersonSearch,

    // source
    getPersonSourceReferences: sources.getPersonSourceReferences,
    getSourceDescription: sources.getSourceDescription,

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