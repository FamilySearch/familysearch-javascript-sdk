NG_DOCS={
  "sections": {
    "api": "API Documentation"
  },
  "pages": [
    {
      "section": "api",
      "id": "index",
      "shortName": "index",
      "type": "overview",
      "moduleName": "index",
      "shortDescription": "Overview",
      "keywords": "$http $q _low_level_commands_plumbing access actual add addition additional adds agent ajax amd angularjs anticipated api app_key approach array arrays asynchronous auth_callback authentication automatically branch browser bugs build builds built call callback called calling calls case catch change changehistory changes childandparents code combine combined comment comments commonjs config console constructors consume contactname contributing convenience cookie copying correct corresponding couple created custom data defer deferred deferred_function dependencies described description_the-promise-api desired developers directory discussion discussions display docs documentation documented easier element elements endpoint endpoints environment error errors errorthrown example examples exist existing expectations expired exposed extended extracting fact facts fail fairly familysearch favor features file files format frag front fulfilled fully function functionality functions generate generated getaccesstoken getallresponseheaders getcurrentuser getgivenname getname getnameandid getperson getresponseheader getstatuscode getsurname getuser gh-pages git github global goal great grunt handle handled handling header headers hello higher-level hopefully host html http http_function idsourceref illustrated implemented includes init javascript jquery js jsdoc jshint jshintrc json kernel keywords list loader loaders located log low-level manage mapped match memories memory memoryref method methods minified minify mock model module my_access_key nameforms names navigate navigating node note noteref notes object objects occur ojects option optional options org original overview parameter parentchild parts pass passed pasting people performed person plumbing port potential prepending project promise promises properties prototype prototypes provided publish pull purpose push read redirect_goes_here redirects referring registered rejected relationships request requests required requires response responses rest retried return returned returning returns running sample sandbox saved script sdk search searchandmatch searchresult serve server set simple single source sourcedescription sourceref sources started starts status strict submitting success suppose surname targets test tests textstatus throttling token tool top transient travis-ci type types typically unit uri url user users var wanted watches website window work works wraps write written your_access_key_goes_here"
    },
    {
      "section": "api",
      "id": "authentication",
      "shortName": "authentication",
      "type": "overview",
      "moduleName": "authentication",
      "shortDescription": "These are the authentication functions. getAccessToken is the main function.",
      "keywords": "api authentication authorization call code docs familysearch function functions getaccesstoken getauthcode https main org overview pass"
    },
    {
      "section": "api",
      "id": "authentication.functions:getAccessToken",
      "shortName": "getAccessToken",
      "type": "function",
      "moduleName": "authentication",
      "shortDescription": "Get the access token for the user.",
      "keywords": "access api authcode authentication call calls code docs don editable ensure example familysearch function functions getauthcode http https making net org passed promise requests require resolves returned store token user"
    },
    {
      "section": "api",
      "id": "authentication.functions:getAuthCode",
      "shortName": "getAuthCode",
      "type": "function",
      "moduleName": "authentication",
      "shortDescription": "Open a popup window to allow the user to authenticate and authorize this application.",
      "keywords": "allow api application authenticate authentication authorization authorize call code docs familysearch function functions getaccesstoken https open org passing popup promise user window"
    },
    {
      "section": "api",
      "id": "authentication.functions:hasAccessToken",
      "shortName": "hasAccessToken",
      "type": "function",
      "moduleName": "authentication",
      "shortDescription": "Return whether the access token exists.",
      "keywords": "access api authentication call discovered erased exist exists expired function functions return returns status token true unauthorized"
    },
    {
      "section": "api",
      "id": "authentication.functions:invalidateAccessToken",
      "shortName": "invalidateAccessToken",
      "type": "function",
      "moduleName": "authentication",
      "shortDescription": "Invalidate the current access token",
      "keywords": "access api authentication current function functions invalidate invalidated promise resolved token"
    },
    {
      "section": "api",
      "id": "changeHistory",
      "shortName": "changeHistory",
      "type": "overview",
      "moduleName": "changeHistory",
      "shortDescription": "Functions related to change histories",
      "keywords": "api change change-history changehistory docs familysearch functions histories https org overview"
    },
    {
      "section": "api",
      "id": "changeHistory.functions:getChildAndParentsChanges",
      "shortName": "getChildAndParentsChanges",
      "type": "function",
      "moduleName": "changeHistory",
      "shortDescription": "Get change history for a child and parents relationship",
      "keywords": "api array caprid change changehistory changes child convenience count docs editable entries example familysearch function functions getchanges history http https includes init net number options opts org params parents pass promise read relationship response return types"
    },
    {
      "section": "api",
      "id": "changeHistory.functions:getCoupleChanges",
      "shortName": "getCoupleChanges",
      "type": "function",
      "moduleName": "changeHistory",
      "shortDescription": "Get change history for a couple relationship",
      "keywords": "api array change changehistory changes convenience count couple crid docs editable entries example familysearch function functions getchanges history http https includes init net number options opts org params pass promise read relationship response return types"
    },
    {
      "section": "api",
      "id": "changeHistory.functions:getPersonChanges",
      "shortName": "getPersonChanges",
      "type": "function",
      "moduleName": "changeHistory",
      "shortDescription": "Get change history for a person",
      "keywords": "api array change changehistory changes convenience count docs editable entries example familysearch function functions getchanges history http https includes init net number options opts org params pass person pid promise read response return types"
    },
    {
      "section": "api",
      "id": "changeHistory.types:type.Change",
      "shortName": "type.Change",
      "type": "function",
      "moduleName": "changeHistory",
      "shortDescription": "Change made to a person or relationship",
      "keywords": "api change changehistory contributor function getchangereason getcontributorname person property reason relationship timestamp title types updated"
    },
    {
      "section": "api",
      "id": "discussions",
      "shortName": "discussions",
      "type": "overview",
      "moduleName": "discussions",
      "shortDescription": "Functions related to discussions",
      "keywords": "api discussions docs familysearch functions https org overview"
    },
    {
      "section": "api",
      "id": "discussions.functions:getComments",
      "shortName": "getComments",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Get comments for a discussion",
      "keywords": "api array comment comments convenience currently discussion discussions docs editable example familysearch function functions getcomments http https includes init net options opts org params pass promise read response types unused"
    },
    {
      "section": "api",
      "id": "discussions.functions:getDiscussion",
      "shortName": "getDiscussion",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Get information about a discussion",
      "keywords": "api convenience currently discussion discussions docs editable example familysearch function functions getdiscussion http https includes init net options opts org params pass promise read response types unused"
    },
    {
      "section": "api",
      "id": "discussions.functions:getMultiDiscussion",
      "shortName": "getMultiDiscussion",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Get multiple discussions at once by requesting them in parallel",
      "keywords": "api currently dids discussion discussions docs editable example familysearch fulfilled function functions getdiscussion http https ids init map multiple net opts org parallel params pass promise read requesting response returning unused"
    },
    {
      "section": "api",
      "id": "discussions.functions:getPersonDiscussionRefs",
      "shortName": "getPersonDiscussionRefs",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Get references to discussions for a person",
      "keywords": "api array convenience currently discussion discussions docs editable example familysearch function functions getdiscussionids http https ids includes init net options opts org params pass person pid promise read references response unused"
    },
    {
      "section": "api",
      "id": "discussions.types:type.Comment",
      "shortName": "type.Comment",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Comment on a discussion",
      "keywords": "api comment contributor created details discussion discussions function functions getagent getcontributorid pass property text timestamp types user"
    },
    {
      "section": "api",
      "id": "discussions.types:type.Discussion",
      "shortName": "type.Discussion",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Discussion",
      "keywords": "api comments contributor created description details discussion discussions function functions getagent getcontributorid modified number numberofcomments pass property text timestamp title types user"
    },
    {
      "section": "api",
      "id": "init",
      "shortName": "init",
      "type": "overview",
      "moduleName": "init",
      "shortDescription": "Call the init function once to initialize the FamilySearch object before calling any other functions.",
      "keywords": "api call calling familysearch function functions init initialize object overview"
    },
    {
      "section": "api",
      "id": "init.functions:init",
      "shortName": "init",
      "type": "function",
      "moduleName": "init",
      "shortDescription": "Initialize the FamilySearch object",
      "keywords": "$http $q $timeout access access_token action ajax angular api app_key auth_callback auto_expire auto_signin blocked call calls clear convenient cookie creating defer deferred deferred_function developer direct environment eventually exist expired false familysearch function functions future global host hour hours http http_function inactivity init initialize issuing jquery js key node oauth2 object optional opts pass pop-up port production prompted re-read received redirect registered requests response result running sandbox save_access_token saved script server session set settimeout sign staging system timeout timeout_function token true uri user user-initiated users whichever"
    },
    {
      "section": "api",
      "id": "memories",
      "shortName": "memories",
      "type": "overview",
      "moduleName": "memories",
      "shortDescription": "Functions related to memories",
      "keywords": "api docs familysearch functions https memories org overview"
    },
    {
      "section": "api",
      "id": "memories.functions:getMemory",
      "shortName": "getMemory",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get information about a memory",
      "keywords": "api convenience currently docs editable example familysearch function functions getmemory http https includes init memories memory net options opts org params pass promise read response types unused"
    },
    {
      "section": "api",
      "id": "memories.functions:getMemoryComments",
      "shortName": "getMemoryComments",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get comments for a memory",
      "keywords": "api array comment comments convenience currently discussions docs editable example familysearch function functions getcomments http https includes init memories memory mid net options opts org params pass promise read response types unused"
    },
    {
      "section": "api",
      "id": "memories.functions:getMemoryPersonas",
      "shortName": "getMemoryPersonas",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get personas for a memory",
      "keywords": "api appears array convenience currently docs editable example familysearch function functions getpersonas http https includes init memories memory mid net options opts org params pass person personas promise read response scaled-down types unused"
    },
    {
      "section": "api",
      "id": "memories.functions:getPersonMemoriesQuery",
      "shortName": "getPersonMemoriesQuery",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get a paged list of memories for a person",
      "keywords": "api array artifacts convenience count defaults docs editable example familysearch function functions getmemories http https includes init list maximum memories memory net number options opts org paged params pass person photo pid promise read response return start story type types values"
    },
    {
      "section": "api",
      "id": "memories.functions:getPersonMemoryRefs",
      "shortName": "getPersonMemoryRefs",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get references to memories for a person",
      "keywords": "api array convenience currently docs editable example familysearch function functions getmemoryrefs http https includes init memories memoryref memoryrefs net options opts org params pass person pid promise read references response types unused"
    },
    {
      "section": "api",
      "id": "memories.functions:getPersonPortraitURL",
      "shortName": "getPersonPortraitURL",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get the URL of the portrait of a person",
      "keywords": "api default docs doesn editable example exist familysearch final follow followredirect function functions http https init memories net options opts org params pass person pid portrait promise redirect return true url"
    },
    {
      "section": "api",
      "id": "memories.functions:getUserMemoriesQuery",
      "shortName": "getUserMemoriesQuery",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get a paged list of memories for a user",
      "keywords": "api array convenience count defaults docs editable example familysearch function functions getmemories http https includes init list maximum memories memory net number options opts org paged params pass promise response return start types user"
    },
    {
      "section": "api",
      "id": "memories.types:type.Memory",
      "shortName": "type.Memory",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Memory",
      "keywords": "api array description filenames function getartifactfilenames getdescription geticonurl getmodified getthumbnailurl gettitle http icon image media mediatype memories memory object org property resource resourcetype thumbnail timestamp title type types url"
    },
    {
      "section": "api",
      "id": "memories.types:type.MemoryRef",
      "shortName": "type.MemoryRef",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "A Memory id and a Memory Persona Id.",
      "keywords": "api connected details function functions getmemory getmemoryid getmemorypersonas memories memory memoryref pass person persona personas property resourceid types"
    },
    {
      "section": "api",
      "id": "notes",
      "shortName": "notes",
      "type": "overview",
      "moduleName": "notes",
      "shortDescription": "Functions related to notes",
      "keywords": "api docs familysearch functions https notes org overview"
    },
    {
      "section": "api",
      "id": "notes.functions:getChildAndParentsNote",
      "shortName": "getChildAndParentsNote",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get information about a child and parents relationship note",
      "keywords": "api caprid child convenience currently docs editable example familysearch function functions getnote http https includes init net nid note notes options opts org params parents pass promise relationship response types unused"
    },
    {
      "section": "api",
      "id": "notes.functions:getChildAndParentsNoteRefs",
      "shortName": "getChildAndParentsNoteRefs",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get the note references for a child and parents relationship",
      "keywords": "api array caprid child convenience currently docs editable example familysearch function functions getnoterefs http https includes init net note noteref noterefs notes options opts org params parents pass promise read references relationship response types unused"
    },
    {
      "section": "api",
      "id": "notes.functions:getCoupleNote",
      "shortName": "getCoupleNote",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get information about a couple relationship note",
      "keywords": "api convenience couple crid currently docs editable example familysearch function functions getnote http https includes init net nid note notes options opts org params pass promise relationship response types unused"
    },
    {
      "section": "api",
      "id": "notes.functions:getCoupleNoteRefs",
      "shortName": "getCoupleNoteRefs",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get the note references for a couple relationship",
      "keywords": "api array convenience couple crid currently docs editable example familysearch function functions getnoterefs http https includes init net note noteref noterefs notes options opts org params pass promise read references relationship response types unused"
    },
    {
      "section": "api",
      "id": "notes.functions:getMultiChildAndParentsNote",
      "shortName": "getMultiChildAndParentsNote",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get multiple notes at once by requesting them in parallel",
      "keywords": "api caprid child currently docs editable example familysearch fulfilled function functions getchildandparentsnote http https ids init map multiple net nids note noteref noterefs notes opts org parallel params parents pass promise read relationship requesting response returning types unused"
    },
    {
      "section": "api",
      "id": "notes.functions:getMultiCoupleNote",
      "shortName": "getMultiCoupleNote",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get multiple notes at once by requesting them in parallel",
      "keywords": "api couple crid currently docs editable example familysearch fulfilled function functions getcouplenote http https ids init map multiple net nids note noteref noterefs notes opts org parallel params pass promise read relationship requesting response returning types unused"
    },
    {
      "section": "api",
      "id": "notes.functions:getMultiPersonNote",
      "shortName": "getMultiPersonNote",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get multiple notes at once by requesting them in parallel",
      "keywords": "api currently docs editable example familysearch fulfilled function functions getpersonnote http https ids init map multiple net nids note noteref noterefs notes opts org parallel params pass person pid promise read requesting response returning types unused"
    },
    {
      "section": "api",
      "id": "notes.functions:getPersonNote",
      "shortName": "getPersonNote",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get information about a note",
      "keywords": "api convenience currently docs editable example familysearch function functions getnote http https includes init net nid note notes options opts org params pass person pid promise response types unused"
    },
    {
      "section": "api",
      "id": "notes.functions:getPersonNoteRefs",
      "shortName": "getPersonNoteRefs",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get note references for a person",
      "keywords": "api array convenience currently docs editable example familysearch function functions getnoterefs http https includes init net note noteref noterefs notes options opts org params pass person pid promise read references response types unused"
    },
    {
      "section": "api",
      "id": "notes.types:type.Note",
      "shortName": "type.Note",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Note",
      "keywords": "api contributor details function functions getagent getcontributorid getmodified note notes pass property subject text timestamp title types user"
    },
    {
      "section": "api",
      "id": "notes.types:type.NoteRef",
      "shortName": "type.NoteRef",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Reference to a note on a person",
      "keywords": "api details function functions getchildandparentsnote getcouplenote getpersonnote note noteref notes pass person property reference subject types"
    },
    {
      "section": "api",
      "id": "parentsAndChildren",
      "shortName": "parentsAndChildren",
      "type": "overview",
      "moduleName": "parentsAndChildren",
      "shortDescription": "Functions related to parents and children relationships",
      "keywords": "api children docs familysearch functions https org overview parents parents-and-children parentsandchildren relationships"
    },
    {
      "section": "api",
      "id": "parentsAndChildren.functions:getChildAndParents",
      "shortName": "getChildAndParents",
      "type": "function",
      "moduleName": "parentsAndChildren",
      "shortDescription": "Get information about a child and parents relationship.",
      "keywords": "access api caprid child childandparents convenience docs editable example familysearch function functions getperson getrelationship http https includes init net object options opts org parameter params parents parentsandchildren pass person persons promise read relationship response return set true types"
    },
    {
      "section": "api",
      "id": "pedigree",
      "shortName": "pedigree",
      "type": "overview",
      "moduleName": "pedigree",
      "shortDescription": "Get someone&#39;s ancestry or descendancy",
      "keywords": "ancestry api descendancy docs familysearch https org overview pedigree"
    },
    {
      "section": "api",
      "id": "pedigree.functions:getAncestry",
      "shortName": "getAncestry",
      "type": "function",
      "moduleName": "pedigree",
      "shortDescription": "Get the ancestors of a specified person and optionally a specified spouse with the following convenience functions",
      "keywords": "additional ancestor ancestors ancestry api array ascendancy convenience docs editable example exists familysearch full function functions generations getascendancynumber getperson getpersons http https includes init max net notes number object objects optionally options opts org params pass pedigree person persondetails persons promise retrieve return returns set spouse true types"
    },
    {
      "section": "api",
      "id": "pedigree.functions:getDescendancy",
      "shortName": "getDescendancy",
      "type": "function",
      "moduleName": "pedigree",
      "shortDescription": "Get the descendants of a specified person and optionally a specified spouse with the following convenience functions",
      "keywords": "additional api array ascendancy convenience descendancy descendants descendency docs editable example exists familysearch function functions generations getancestry getdescendancynumber getperson getpersons http https includes init max net notes number object objects optionally options opts org params parts pass pedigree person persons promise retrieve return returns separate spouse surname true types unavailable"
    },
    {
      "section": "api",
      "id": "person",
      "shortName": "person",
      "type": "overview",
      "moduleName": "person",
      "shortDescription": "Functions related to persons",
      "keywords": "api docs familysearch functions https org overview person persons"
    },
    {
      "section": "api",
      "id": "person.functions:getMultiPerson",
      "shortName": "getMultiPerson",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get multiple people at once by requesting them in parallel",
      "keywords": "api currently docs editable example familysearch fulfilled function functions getperson http https init map multiple net options opts org parallel params pass people person pids promise read requesting response returning unused"
    },
    {
      "section": "api",
      "id": "person.functions:getPerson",
      "shortName": "getPerson",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get the specified person",
      "keywords": "api convenience currently docs editable example familysearch function functions getperson http https includes init net options opts org params pass person pid promise read response types unused"
    },
    {
      "section": "api",
      "id": "person.functions:getPersonChangeSummary",
      "shortName": "getPersonChangeSummary",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get the change summary for a person. For detailed change information see functions in the changeHistory module",
      "keywords": "api array broken change changehistory changes convenience currently detailed docs editable endpoint example familysearch function functions getchanges http https includes init module net options opts org params pass person pid promise published read response rest sandbox summary test timestamp title unable unused updated"
    },
    {
      "section": "api",
      "id": "person.functions:getPersonWithRelationships",
      "shortName": "getPersonWithRelationships",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get a person and their children, spouses, and parents.",
      "keywords": "addition api array child childandparents children convenience couple docs editable example familysearch father full function functions getchildids getchildidsof getchildrelationships getchildrelationshipsof getchildren getchildrenof getfatherids getfathers getmotherids getmothers getparentrelationships getperson getprimaryid getprimaryperson getspouseids getspouserelationship getspouserelationships getspouses http https ids init mother net null object objects options opts org params parent parents pass person persons pid primary promise read relationship relationships relative requested response retrieve return set spouse spouseid spouses true types"
    },
    {
      "section": "api",
      "id": "person.functions:getRelationshipsToChildren",
      "shortName": "getRelationshipsToChildren",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get the relationships to a person&#39;s children.",
      "keywords": "access api array children convenience docs editable example familysearch function functions getchildids getperson getrelationships http https ids includes init net object options opts org parameter params parentchild pass person persons pid promise read relationship relationships response return set string true types"
    },
    {
      "section": "api",
      "id": "person.functions:getRelationshipsToParents",
      "shortName": "getRelationshipsToParents",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get the relationships to a person&#39;s parents.",
      "keywords": "access api array convenience docs editable example familysearch fatherid function functions getchildandparents getperson getrelationships http https includes init motherid net object options opts org parameter params parents parentsandchildren pass person persons pid promise read relationship relationships response return set true types"
    },
    {
      "section": "api",
      "id": "person.functions:getRelationshipsToSpouses",
      "shortName": "getRelationshipsToSpouses",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get the relationships to a person&#39;s spouses.",
      "keywords": "access api array convenience couple docs editable example familysearch function functions getperson getrelationships getspouseids http https ids includes init net object options opts org parameter params pass person persons pid promise read relationship relationships response return set spouses string true types"
    },
    {
      "section": "api",
      "id": "person.types:type.ChildAndParents",
      "shortName": "type.ChildAndParents",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Child and parents relationship (not to be confused with the ParentChild relationship; in general, ChildAndParents is more useful)",
      "keywords": "api array child childandparents confused fact facts father function general getchildid getfatherfacts getfatherid getmotherfacts getmotherid mother parent-relationship parentchild parents person property relationship type types"
    },
    {
      "section": "api",
      "id": "person.types:type.Couple",
      "shortName": "type.Couple",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Couple relationship",
      "keywords": "api array couple fact facts function getfacts gethusbandid getmarriagefact getwifeid http husband marriage multiple org person property relationship type types wife"
    },
    {
      "section": "api",
      "id": "person.types:type.Fact",
      "shortName": "type.Fact",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Fact",
      "keywords": "api contributor details event fact form function functions getagent getcontributorid getdate getformaldate getmodified getplace http modified org original pass person place property standard timestamp type types user"
    },
    {
      "section": "api",
      "id": "person.types:type.Name",
      "shortName": "type.Name",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Name",
      "keywords": "api contributor details form forms full function functions getagent getcontributorid getfulltext getgivenname getmodified getnameformscount getsurname http modified number org pass person preferred property read surname text timestamp true type types user"
    },
    {
      "section": "api",
      "id": "person.types:type.ParentChild",
      "shortName": "type.ParentChild",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "ParentChild relationship (not to be confused with the ChildAndParents relationship; in general, ChildAndParents is more useful)",
      "keywords": "api child childandparents confused function general getchildandparentsid getchildid parent-child parentchild parents person property relationship types"
    },
    {
      "section": "api",
      "id": "person.types:type.Person",
      "shortName": "type.Person",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Person",
      "keywords": "api array attributes birth birthdate birthplace death deathdate deathplace display fact facts false female function gender getbirthdate getbirthplace getdeathdate getdeathplace getfacts getgender getgivenname getlifespan getname getnames getsurname includes lifespan living male names person place preferred property surname true types year"
    },
    {
      "section": "api",
      "id": "plumbing",
      "shortName": "plumbing",
      "type": "overview",
      "moduleName": "plumbing",
      "shortDescription": "These are the low-level &quot;plumbing&quot; functions. You don&#39;t normally need to use these functions.",
      "keywords": "api don functions low-level overview plumbing"
    },
    {
      "section": "api",
      "id": "plumbing.functions:del",
      "shortName": "del",
      "type": "function",
      "moduleName": "plumbing",
      "shortDescription": "Low-level call to delete to a specific REST endpoint from FamilySearch",
      "keywords": "api behaves call data delete endpoint familysearch function functions headers http init low-level map options opts pass plumbing promise promises relative response responsemapper rest returned specific url"
    },
    {
      "section": "api",
      "id": "plumbing.functions:get",
      "shortName": "get",
      "type": "function",
      "moduleName": "plumbing",
      "shortDescription": "Low-level call to get a specific REST endpoint from FamilySearch",
      "keywords": "api behaves call data endpoint familysearch function functions headers http init low-level map options opts parameters params pass plumbing promise promises query relative response responsemapper rest returned specific url"
    },
    {
      "section": "api",
      "id": "plumbing.functions:getTotalProcessingTime",
      "shortName": "getTotalProcessingTime",
      "type": "function",
      "moduleName": "plumbing",
      "shortDescription": "Return the total &quot;processing time&quot; spent in FamilySearch REST endpoints",
      "keywords": "api endpoints familysearch function functions milliseconds plumbing processing rest return spent time total"
    },
    {
      "section": "api",
      "id": "plumbing.functions:http",
      "shortName": "http",
      "type": "function",
      "moduleName": "plumbing",
      "shortDescription": "Low-level call to issue an http request to a specific REST endpoint from FamilySearch",
      "keywords": "api behaves call data delete endpoint familysearch function functions headers http init issue low-level map method number object options opts pass plumbing post promise promises relative request response responsemapper rest retries retry return returned specific times url"
    },
    {
      "section": "api",
      "id": "plumbing.functions:post",
      "shortName": "post",
      "type": "function",
      "moduleName": "plumbing",
      "shortDescription": "Low-level call to post to a specific REST endpoint from FamilySearch",
      "keywords": "api behaves call data endpoint familysearch function functions headers http init low-level map options opts pass plumbing post promise promises relative response responsemapper rest returned specific url"
    },
    {
      "section": "api",
      "id": "plumbing.functions:put",
      "shortName": "put",
      "type": "function",
      "moduleName": "plumbing",
      "shortDescription": "Low-level call to put to a specific REST endpoint from FamilySearch",
      "keywords": "api behaves call data endpoint familysearch function functions headers http init low-level map options opts pass plumbing post promise promises relative response responsemapper rest returned specific url"
    },
    {
      "section": "api",
      "id": "plumbing.functions:setTotalProcessingTime",
      "shortName": "setTotalProcessingTime",
      "type": "function",
      "moduleName": "plumbing",
      "shortDescription": "Set the &quot;processing time&quot; spent in FamilySearch REST endpoints.",
      "keywords": "api counter endpoints familysearch function functions milliseconds plumbing processing reset rest set spent time wanted"
    },
    {
      "section": "api",
      "id": "searchAndMatch",
      "shortName": "searchAndMatch",
      "type": "overview",
      "moduleName": "searchAndMatch",
      "shortDescription": "Functions related to search and match",
      "keywords": "api docs familysearch functions https match org overview search search-and-match searchandmatch"
    },
    {
      "section": "api",
      "id": "searchAndMatch.functions:getPersonMatches",
      "shortName": "getPersonMatches",
      "type": "function",
      "moduleName": "searchAndMatch",
      "shortDescription": "Get the matches (possible duplicates) for a person",
      "keywords": "api array convenience currently docs duplicates editable example familysearch function functions getindex getresultscount getsearchresults http https includes init matches net number options opts org params pass person promise read response search searchandmatch searchresult searchresults starting total types unused"
    },
    {
      "section": "api",
      "id": "searchAndMatch.functions:getPersonMatchesQuery",
      "shortName": "getPersonMatchesQuery",
      "type": "function",
      "moduleName": "searchAndMatch",
      "shortDescription": "Get matches for someone not in the tree",
      "keywords": "api array candidateid context convenience described docs editable example exception familysearch function functions getindex getpersonsearch getresultscount getsearchresults http https includes init match matches net number options opts org parameter parameters params pass person promise response restricts search searchandmatch searchresult searchresults starting total tree types valid"
    },
    {
      "section": "api",
      "id": "searchAndMatch.functions:getPersonSearch",
      "shortName": "getPersonSearch",
      "type": "function",
      "moduleName": "searchAndMatch",
      "shortDescription": "Search people",
      "keywords": "additional allows api append array birthdate birthplace context convenience count dates deathdate deathplace described docs editable example familysearch father female full function functions gender getcontext getindex getresultscount getsearchresults givenname http https includes init list male marriagedate marriageplace matches mother net non-exact number options opts org parameter parameters params pass people places promise requests response result returned search searchandmatch searchresult searchresults spouse start starting subsequent surname tilde token total types work works"
    },
    {
      "section": "api",
      "id": "searchAndMatch.types:type.SearchResult",
      "shortName": "type.SearchResult",
      "type": "function",
      "moduleName": "searchAndMatch",
      "shortDescription": "Reference from a person or relationship to a source",
      "keywords": "api array aware better child father function functions getchildids getchildren getfatherids getfathers getmotherids getmothers getperson getprimaryperson getspouseids getspouses higher mother objects pedigree person persons primary property reference relationship result returned score search searchandmatch searchresult searchresults source spouse title types"
    },
    {
      "section": "api",
      "id": "sourceBox",
      "shortName": "sourceBox",
      "type": "overview",
      "moduleName": "sourceBox",
      "shortDescription": "Functions related to a user&#39;s source box",
      "keywords": "api box docs familysearch functions https org overview source source-box sourcebox user"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:getCollection",
      "shortName": "getCollection",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Get information about a user-defined collection",
      "keywords": "api collection convenience currently docs editable example familysearch function functions getcollection http https includes init net options opts org params pass promise read response sourcebox types unused user-defined"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:getCollectionsForUser",
      "shortName": "getCollectionsForUser",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Search people",
      "keywords": "api array box collection collections convenience currently docs editable example familysearch function functions getcollections http https includes init net options opts org owns params pass people promise response search source sourcebox types uid unused user"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:getCollectionSourceDescriptions",
      "shortName": "getCollectionSourceDescriptions",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Get a paged list of source descriptions in a user-defined collection",
      "keywords": "api array cid collection convenience count descriptions docs editable example familysearch function functions getsourcedescriptions http https includes init list maximum net options opts org paged params pass promise read response return source sourcebox sourcedescription sourcedescriptions sources start types user-defined zero-based"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:getCollectionSourceDescriptionsForUser",
      "shortName": "getCollectionSourceDescriptionsForUser",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Get a paged list of source descriptions in all user-defined collections defined by a user",
      "keywords": "api array collections convenience count defined descriptions docs editable example familysearch function functions getsourcedescriptions http https includes init list maximum net options opts org paged params pass promise read response return source sourcebox sourcedescription sourcedescriptions sources start types uid user user-defined zero-based"
    },
    {
      "section": "api",
      "id": "sourceBox.types:type.Collection",
      "shortName": "type.Collection",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Collection",
      "keywords": "api collection contributor details folder function functions getagent getcontributorid number pass property size sourcebox sources title types user"
    },
    {
      "section": "api",
      "id": "sources",
      "shortName": "sources",
      "type": "overview",
      "moduleName": "sources",
      "shortDescription": "Functions related to sources",
      "keywords": "api docs familysearch functions https org overview sources"
    },
    {
      "section": "api",
      "id": "sources.functions:getChildAndParentsSourceRefs",
      "shortName": "getChildAndParentsSourceRefs",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get the source references for a child and parents relationship",
      "keywords": "api array child convenience currently docs editable example familysearch function functions getsourcerefs http https includes init net options opts org params parents pass promise read references relationship response source sourceref sourcerefs sources types unused"
    },
    {
      "section": "api",
      "id": "sources.functions:getCoupleSourceRefs",
      "shortName": "getCoupleSourceRefs",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get the source references for a couple relationship",
      "keywords": "api array convenience couple crid currently docs editable example familysearch function functions getsourcerefs http https includes init net options opts org params pass promise read references relationship response source sourceref sourcerefs sources types unused"
    },
    {
      "section": "api",
      "id": "sources.functions:getMultiSourceDescription",
      "shortName": "getMultiSourceDescription",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get multiple source descriptions at once by requesting them in parallel",
      "keywords": "api currently description descriptions docs editable example familysearch fulfilled function functions getsourcedescription http https ids init map multiple net opts org parallel params pass promise read requesting response returning sdids source sourceref sourcerefs sources types unused"
    },
    {
      "section": "api",
      "id": "sources.functions:getPersonSourceRefs",
      "shortName": "getPersonSourceRefs",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get references to sources for a person",
      "keywords": "api array convenience currently docs editable example familysearch function functions getsourcerefs http https includes init net options opts org params pass person pid promise read references response sourceref sourcerefs sources types unused"
    },
    {
      "section": "api",
      "id": "sources.functions:getSourceDescription",
      "shortName": "getSourceDescription",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get information about a source",
      "keywords": "api convenience currently description docs editable example familysearch function functions getsourcedescription http https includes init net options opts org params pass promise read response sdid source sourcedescription sources types unused"
    },
    {
      "section": "api",
      "id": "sources.functions:getSourceRefsQuery",
      "shortName": "getSourceRefsQuery",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get the people, couples, and child-and-parents relationships referencing a source",
      "keywords": "api array child-and-parents convenience couples currently description docs editable example familysearch function functions getchildandparentsidsourcerefs getcoupleidsourcerefs getpersonidsourcerefs http https idsourceref idsourcerefs includes init net options opts org params pass people promise referencing relationships response sdid source sources types unused"
    },
    {
      "section": "api",
      "id": "sources.types:type.IdSourceRef",
      "shortName": "type.IdSourceRef",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "A person or relationship id and a SourceRef",
      "keywords": "api function getsourceref idsourceref person property relationship sourceref sources types"
    },
    {
      "section": "api",
      "id": "sources.types:type.SourceDescription",
      "shortName": "type.SourceDescription",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Description of a source",
      "keywords": "api citation contributor description details function functions getagent getcitation getcontributorid getmodified gettext gettitle modified pass property record source sourcedescription sources text timestamp title types url user"
    },
    {
      "section": "api",
      "id": "sources.types:type.SourceRef",
      "shortName": "type.SourceRef",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Reference from a person or relationship to a source",
      "keywords": "api array change contributor description details function functions getagent getchangemessage getcontributorid getmodified getsourcedescription getsourcedescriptionid gettagnames http modified names org pass person property reason reference relationship source sourceref sources tag timestamp types user"
    },
    {
      "section": "api",
      "id": "spouses",
      "shortName": "spouses",
      "type": "overview",
      "moduleName": "spouses",
      "shortDescription": "Functions related to spouse relationships",
      "keywords": "api docs familysearch functions https org overview relationships spouse spouses"
    },
    {
      "section": "api",
      "id": "spouses.functions:getCouple",
      "shortName": "getCouple",
      "type": "function",
      "moduleName": "spouses",
      "shortDescription": "Get information about a couple relationship",
      "keywords": "access api convenience couple crid docs editable example familysearch function functions getperson getrelationship http https includes init net object options opts org parameter params pass person persons promise read relationship response return set spouses true types"
    },
    {
      "section": "api",
      "id": "user",
      "shortName": "user",
      "type": "overview",
      "moduleName": "user",
      "shortDescription": "Functions related to users",
      "keywords": "api docs familysearch functions https org overview user users"
    },
    {
      "section": "api",
      "id": "user.functions:getAgent",
      "shortName": "getAgent",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "Get information about the specified agent (contributor)",
      "keywords": "agent aid api contributor convenience currently docs editable example familysearch function functions getagent http https includes init net options opts org params pass response types unused user"
    },
    {
      "section": "api",
      "id": "user.functions:getCurrentUser",
      "shortName": "getCurrentUser",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "Get the current user with the following convenience function",
      "keywords": "api convenience current currently docs editable example familysearch function functions getuser http https init net options opts org params pass promise response types unused user"
    },
    {
      "section": "api",
      "id": "user.functions:getCurrentUserPersonId",
      "shortName": "getCurrentUserPersonId",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "Get the id of the current user person in the tree; pass into getPerson for details",
      "keywords": "api current currently details docs editable example familysearch function functions getperson http https init net options opts org params pass person promise tree unused user"
    },
    {
      "section": "api",
      "id": "user.functions:getMultiAgent",
      "shortName": "getMultiAgent",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "Get multiple agents at once by requesting them in parallel",
      "keywords": "agent agents aids api currently docs editable example familysearch fulfilled function functions getagent http https ids init map multiple net opts org parallel params pass promise read requesting response returning unused user"
    },
    {
      "section": "api",
      "id": "user.types:type.Agent",
      "shortName": "type.Agent",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "An agent is returned from getAgent.",
      "keywords": "account agent api contact contributor email function functions getaccountname getagent getemail getname ids property returned types user"
    },
    {
      "section": "api",
      "id": "user.types:type.User",
      "shortName": "type.User",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "User - a user is returned from getCurrentUser;",
      "keywords": "agent api contact contactname contributor email full fullname function functions getcurrentuser ids property returned treeuserid types user"
    }
  ],
  "apis": {
    "api": true
  },
  "html5Mode": false,
  "startPage": "/api",
  "scripts": [
    "angular.min.js"
  ]
};