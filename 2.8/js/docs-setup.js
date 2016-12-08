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
      "keywords": "_getnameandid access access_token accessing add addition additional adds agent aleksandrova allows amd anastasia anticipated api app array arrays asynchronous attributes attribution authentication automatically background bits body bower browser buffer built call callback called calls case cdn change changehistory changemessage changes childandparents class client client_id close code comment common commonjs console constructors consume contactname convenience cookie correct corresponding couple create createname createperson creating custom data deletable delete deleting described desired directly discussion discussionref discussions display docs document doesn don easier editable element elements endpoint endpoints environment equivalent error errors example examples exist expects expired exposed extended extracting fact facts familysearch familysearch-javascript-sdk familysearchoauthreceiver features file follow fs fulfilled fulltext fully function functions getaccesstoken getall getbody getcontactname getcurrentuser getdata getdisplayname getgivenname getheader getid getperson getpersonwithrelationships getrequest getstatuscode getsurname getuser git givenname global goal google great guidelines handle handled handling header headers hello higher-level host href html html5rocks http https illustrated includes install installation instance integer integration javascript jquery js jsdelivr jsfiddle json learn link links loaders location log low-level maintain manage mapped match matches memories memory memoryartifactref memorypersona memorypersonaref message method min mobile model modifying module modules multiple my_client_id nameforms names navigate navigating nest net node note notes npm object objects occassionally ojects opener opens option optional options org original overview parameter parentsandchildren parts pass people performed person plumbing point popup port processed project promise promises properties prototype prototypes raw read reason record redirect_uri redirect_uri_goes_here reference referring registered rejected relationships representing request require resolving response responses rest retried return returned returning returns running safari save saved script sdk search searchandmatch searchresult send server set setchangemessage setfulltext setgivenname setsurname setter settype shortcuts simple simplified single some_access_token sourcedescription sourceref sources spouses src status string structure success support supported suppose surname tab tabs throttling times token top transient true type types typically update updating uri url user users values var versioned versioning wanted window work works wraps write your_client_id_goes_here"
    },
    {
      "section": "api",
      "id": "attribution",
      "shortName": "attribution",
      "type": "overview",
      "moduleName": "attribution",
      "shortDescription": "Functions related to an attribution object",
      "keywords": "api attribution functions object overview"
    },
    {
      "section": "api",
      "id": "attribution.functions:createAttribution",
      "shortName": "createAttribution",
      "type": "function",
      "moduleName": "attribution",
      "shortDescription": "Create an Attribution object. Use this method instead of calling the constructor directly.",
      "keywords": "api attribution calling create data directly function functions method object org types"
    },
    {
      "section": "api",
      "id": "attribution.types:constructor.Attribution",
      "shortName": "constructor.Attribution",
      "type": "function",
      "moduleName": "attribution",
      "shortDescription": "Attribution",
      "keywords": "agent api attribution change client data details familysearch function functions getagent getagentid getagenturl getchangemessage getmodifiedtimestamp message object pass promise raw response sdk timestamp types url user"
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
      "keywords": "access allow api app authcode authentication call calls code docs don ensure familysearch function functions getauthcode getoauth2authorizeurl handle herokuapp https initiate making method org passed piece popup process promise recieve redirects requests require resolves returned sample site store token user"
    },
    {
      "section": "api",
      "id": "authentication.functions:getAccessTokenForMobile",
      "shortName": "getAccessTokenForMobile",
      "type": "function",
      "moduleName": "authentication",
      "shortDescription": "Get the access token for the user, passing in their user name and password",
      "keywords": "access api apps authentication call calls docs don ensure familysearch function functions getaccesstoken https making mobile org passing password promise require resolves returned store token user username"
    },
    {
      "section": "api",
      "id": "authentication.functions:getAccessTokenWithClientCredentials",
      "shortName": "getAccessTokenWithClientCredentials",
      "type": "function",
      "moduleName": "authentication",
      "shortDescription": "Get an access token via client credentials.",
      "keywords": "access api authentication client createprivatekey credentials descrypting function functions key matches parameter password pem pem-encoded production promise sake testing time token ursacreateprivatekeypem-password-encoding"
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
      "id": "authentication.functions:getOAuth2AuthorizeURL",
      "shortName": "getOAuth2AuthorizeURL",
      "type": "function",
      "moduleName": "authentication",
      "shortDescription": "Get the URL that a user should be redirected to for initiating",
      "keywords": "api app authentication authorize example function functions herokuapp https initiating oauth2 optional parameter redirect redirected sample url user"
    },
    {
      "section": "api",
      "id": "authentication.functions:getUnauthenticatedAccessToken",
      "shortName": "getUnauthenticatedAccessToken",
      "type": "function",
      "moduleName": "authentication",
      "shortDescription": "Get an unauthenticated access token for APIs that allow it (currently only the",
      "keywords": "access address allow api apis authentication docs familysearch function functions https ip ipaddress org places promise resolves token unauthenticated user"
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
      "id": "authorities",
      "shortName": "authorities",
      "type": "overview",
      "moduleName": "authorities",
      "shortDescription": "Functions related to authorities",
      "keywords": "api authorities docs familysearch functions https org overview"
    },
    {
      "section": "api",
      "id": "authorities.functions:createDate",
      "shortName": "createDate",
      "type": "function",
      "moduleName": "authorities",
      "shortDescription": "Create a Date object. Use this method instead of calling the constructor directly.",
      "keywords": "api authorities calling create data directly function functions method object org types"
    },
    {
      "section": "api",
      "id": "authorities.functions:getDate",
      "shortName": "getDate",
      "type": "function",
      "moduleName": "authorities",
      "shortDescription": "Get the standardized date",
      "keywords": "api authorities docs familysearch function functions getdate https org promise response standardize standardized text types"
    },
    {
      "section": "api",
      "id": "authorities.types:constructor.Date",
      "shortName": "constructor.Date",
      "type": "function",
      "moduleName": "authorities",
      "shortDescription": "Date",
      "keywords": "api authorities client data familysearch formal function getformal getnormalized getoriginal normalized object original raw sdk setformal setnormalized setoriginal string types"
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
      "id": "changeHistory.functions:createChange",
      "shortName": "createChange",
      "type": "function",
      "moduleName": "changeHistory",
      "shortDescription": "Create a Change object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling change changehistory create data directly field function functions method object org types"
    },
    {
      "section": "api",
      "id": "changeHistory.functions:getChanges",
      "shortName": "getChanges",
      "type": "function",
      "moduleName": "changeHistory",
      "shortDescription": "Get change history for a person, couple, or child and parents.",
      "keywords": "api array change changehistory changes child convenience count couple docs endpoint entries full function functions getchanges history https includes number org params parent parents person promise response return types url"
    },
    {
      "section": "api",
      "id": "changeHistory.functions:restoreChange",
      "shortName": "restoreChange",
      "type": "function",
      "moduleName": "changeHistory",
      "shortDescription": "Restore the specified change",
      "keywords": "api change changehistory changes endpoint full function functions https org promise response restore url"
    },
    {
      "section": "api",
      "id": "changeHistory.types:constructor.Change",
      "shortName": "constructor.Change",
      "type": "function",
      "moduleName": "changeHistory",
      "shortDescription": "Change made to a person or relationship",
      "keywords": "agent api change changehistory client data details familysearch function functions getagent getagentname getagenturl getchangereason getid gettitle https object org pass person promise raw reason relationship response restore sdk timestamp title types updated url user"
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
      "id": "discussions.functions:createComment",
      "shortName": "createComment",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Create a Comment object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling comment create data directly discussions function functions method object org types"
    },
    {
      "section": "api",
      "id": "discussions.functions:createDiscussion",
      "shortName": "createDiscussion",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Create a Discussion object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly discussion discussions function functions method object org types"
    },
    {
      "section": "api",
      "id": "discussions.functions:createDiscussionRef",
      "shortName": "createDiscussionRef",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Create a DiscussionRef object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly discussionref discussions function functions method object org types"
    },
    {
      "section": "api",
      "id": "discussions.functions:deleteComment",
      "shortName": "deleteComment",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Delete the specified discussion or memory comment",
      "keywords": "api comment delete discussion discussions docs familysearch full function functions https memory org promise response url"
    },
    {
      "section": "api",
      "id": "discussions.functions:deleteDiscussion",
      "shortName": "deleteDiscussion",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Delete the specified discussion",
      "keywords": "__note__ api attach aware best change changemessage committed corresponding delete discussion discussion-reference discussions docs familysearch full function functions hasn https ignored issue linked message org people person promise response single url"
    },
    {
      "section": "api",
      "id": "discussions.functions:deleteDiscussionRef",
      "shortName": "deleteDiscussionRef",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Delete the specified discussion reference",
      "keywords": "api change changemessage delete discussion discussions docs drid familysearch full function functions https message org person pid promise reference response set url"
    },
    {
      "section": "api",
      "id": "discussions.functions:getDiscussion",
      "shortName": "getDiscussion",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Get information about a discussion",
      "keywords": "api convenience discussion discussions docs familysearch full function functions getdiscussion https includes org promise read response types url"
    },
    {
      "section": "api",
      "id": "discussions.functions:getDiscussionComments",
      "shortName": "getDiscussionComments",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Get comments for a discussion",
      "keywords": "api array comment comments convenience discussion discussion-comments discussions docs endpoint familysearch full function functions getcomments https includes org promise response types url"
    },
    {
      "section": "api",
      "id": "discussions.functions:getMultiDiscussion",
      "shortName": "getMultiDiscussion",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Get multiple discussions at once by requesting them in parallel",
      "keywords": "api discussionref discussionrefs discussions docs familysearch fulfilled full function functions getdiscussion https keyed map multiple org parallel promise read requesting responses returning types url urls"
    },
    {
      "section": "api",
      "id": "discussions.functions:getPersonDiscussionRefs",
      "shortName": "getPersonDiscussionRefs",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "This method is deprecated as of March 2017. Use getPerson() to retrieve discussion references.",
      "keywords": "__ __this api array convenience deprecated discussion discussionref discussionrefs discussions docs endpoint familysearch full function functions getdiscussionrefs getperson https includes march method org person person-discussion-references promise references response retrieve types url"
    },
    {
      "section": "api",
      "id": "discussions.types:constructor.Comment",
      "shortName": "constructor.Comment",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Comment on a discussion or memory",
      "keywords": "_note_ _refresh_ api change changemessage client comment comments contributor create creating data delete deletediscussioncomment deletememorycomment details discussion discussions distinguished existing familysearch function functions getagent getagentid getagenturl getcommenturl getcreatedtimestamp getid gettext ignored individual list memories memory message object parameter pass presence promise property raw read required response save sdk set text timestamp types update updating url user"
    },
    {
      "section": "api",
      "id": "discussions.types:constructor.Discussion",
      "shortName": "constructor.Discussion",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Discussion",
      "keywords": "__note__ api attach aware best change changemessage client comments committed contributor corresponding create data delete deletediscussion description details discussion discussion-reference discussions endpoint existing familysearch fulfilled function functions getagent getagentid getagenturl getcomments getcommentsurl getcreatedtimestamp getdetails getdiscussioncomments getdiscussionurl getid getmodifiedtimestamp getnumberofcomments gettitle hasn ignored issue linked message millis number object pass people person promise raw read refresh response save sdk single text timestamp title true types update updated url user"
    },
    {
      "section": "api",
      "id": "discussions.types:constructor.DiscussionRef",
      "shortName": "constructor.DiscussionRef",
      "type": "function",
      "moduleName": "discussions",
      "shortDescription": "Reference to a discussion on a person.",
      "keywords": "_discussion_ _note_ access api attribution change changemessage client create created data delete deleted deletediscussionref details discussion discussionref discussions existing familysearch function functions getattribution getdiscussion getdiscussionrefurl getdiscussionurl getid getresource getresourceid individual list message needed null object pass person personid promise read reference references response save sdk set setdiscussion token types updated updating url"
    },
    {
      "section": "api",
      "id": "fact",
      "shortName": "fact",
      "type": "overview",
      "moduleName": "fact",
      "shortDescription": "Fact",
      "keywords": "api fact overview"
    },
    {
      "section": "api",
      "id": "fact.functions:createFact",
      "shortName": "createFact",
      "type": "function",
      "moduleName": "fact",
      "shortDescription": "Create a Fact object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly fact function functions method object org types"
    },
    {
      "section": "api",
      "id": "fact.types:constructor.Fact",
      "shortName": "constructor.Fact",
      "type": "function",
      "moduleName": "fact",
      "shortDescription": "Fact",
      "keywords": "api april authorities authority call case client custom data declares description descriptions event fact facts familysearch formal formaldate format forms function gedcomx getdate getformaldate getid getnormalizeddate getnormalizedplace getnormalizedplaceid getoriginaldate getoriginalplace getplace gettype getvalue http iscustomnonevent isnonevent item non-event normalized normalizeddate object org original place placedescription places raw sdk set setcustomnonevent setdate setformaldate setnormalizeddate setnormalizedplace setoriginaldate setoriginalplace setplace sets settype standard string text true type types user written"
    },
    {
      "section": "api",
      "id": "familysearch.types:constructor.BaseClass",
      "shortName": "constructor.BaseClass",
      "type": "function",
      "moduleName": "familysearch",
      "shortDescription": "Base class constructor which all other classes inherit from.",
      "keywords": "addlink addlinks agent api attribution automatically base baseclass call change class classes client data familysearch function getattribution getid getlink getlinkpromise getlinks header headers http inherit json link links location message object promise raw rel representing response sdk selfrel serialized setattribution setid string stringify tojson tostring types update updatefromresponse"
    },
    {
      "section": "api",
      "id": "familysearch.types:constructor.FamilySearch",
      "shortName": "constructor.FamilySearch",
      "type": "function",
      "moduleName": "familysearch",
      "shortDescription": "Initialize the FamilySearch object",
      "keywords": "__warning__ access access_token action api array auto_expire auto_signin blocked call called calls clear client client_id console convenient cookie cors-api-specifiation-request debug details developer development direct documentation enabled environment exist expire_callback expired expires false familysearch function future host hour hours inactivity init initialize integration issue js key logging mobile modifications node oauth2 object opts org overview pass pending pending_modifications pop-up port preflight production prompted re-read received redirect redirect_uri registered request requests require response result running safari save_access_token saved script server session set sign spec staging system token true turn types uri user user-initiated w3 whichever"
    },
    {
      "section": "api",
      "id": "gender.functions:createGender",
      "shortName": "createGender",
      "type": "function",
      "moduleName": "gender",
      "shortDescription": "Create a Gender object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions gender method object org types"
    },
    {
      "section": "api",
      "id": "gender.types:constructor.Gender",
      "shortName": "constructor.Gender",
      "type": "function",
      "moduleName": "gender",
      "shortDescription": "Gender",
      "keywords": "api client data familysearch function gender gettype object org raw sdk settype type types"
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
      "id": "memories.functions:createMemory",
      "shortName": "createMemory",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Create a Memory object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions memories memory method object org types"
    },
    {
      "section": "api",
      "id": "memories.functions:createMemoryArtifactRef",
      "shortName": "createMemoryArtifactRef",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Create a MemoryArtifactRef object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions memories memoryartifactref method object org types"
    },
    {
      "section": "api",
      "id": "memories.functions:createMemoryPersona",
      "shortName": "createMemoryPersona",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Create a MemoryPersona object. Use this method instead of calling the constructor directly.",
      "keywords": "additional api calling create data directly function functions memories memory memoryperson memorypersona method object org types"
    },
    {
      "section": "api",
      "id": "memories.functions:createMemoryPersonaRef",
      "shortName": "createMemoryPersonaRef",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Create a MemoryPersonaRef object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions memories memorypersonaref method object org types"
    },
    {
      "section": "api",
      "id": "memories.functions:deleteMemory",
      "shortName": "deleteMemory",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Delete the specified memory",
      "keywords": "api delete docs familysearch full function functions https memories memory org promise response url"
    },
    {
      "section": "api",
      "id": "memories.functions:deleteMemoryPersona",
      "shortName": "deleteMemoryPersona",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Delete the specified memory persona",
      "keywords": "api delete docs familysearch full function functions https memories memory org persona promise response url"
    },
    {
      "section": "api",
      "id": "memories.functions:deleteMemoryPersonaRef",
      "shortName": "deleteMemoryPersonaRef",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Delete the specified memory persona ref",
      "keywords": "api delete docs familysearch full function functions https memories memory org persona promise reference response url"
    },
    {
      "section": "api",
      "id": "memories.functions:getMemory",
      "shortName": "getMemory",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get information about a memory",
      "keywords": "api convenience docs familysearch full function functions getmemory https includes memories memory org promise response types url"
    },
    {
      "section": "api",
      "id": "memories.functions:getMemoryComments",
      "shortName": "getMemoryComments",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get comments for a memory",
      "keywords": "api array comment comments convenience discussions docs endpoint familysearch full function functions getcomments https includes memories memory memory-comments org promise response types url"
    },
    {
      "section": "api",
      "id": "memories.functions:getMemoryPersona",
      "shortName": "getMemoryPersona",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get a single memory persona",
      "keywords": "api convenience docs familysearch full function functions getmemorypersona https includes memories memory memorypersona org persona promise response single types url"
    },
    {
      "section": "api",
      "id": "memories.functions:getMemoryPersonaRefs",
      "shortName": "getMemoryPersonaRefs",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "This method is deprecated as of March 2017. Use getPerson() to retrieve memory references.",
      "keywords": "__ __this api array convenience deprecated docs endpoint familysearch full function functions getmemorypersonarefs getperson https includes march memories memory memorypersonaref memorypersonarefs method org person person-memory-references promise references response retrieve types url"
    },
    {
      "section": "api",
      "id": "memories.functions:getMemoryPersonas",
      "shortName": "getMemoryPersonas",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get personas for a memory",
      "keywords": "api array convenience docs endpoint familysearch full function functions getmemorypersonas https includes memories memory memory-personas memorypersona memorypersonas org personas promise response types url"
    },
    {
      "section": "api",
      "id": "memories.functions:getPersonMemoriesQuery",
      "shortName": "getPersonMemoriesQuery",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get a paged list of memories for a person",
      "keywords": "api array artifacts convenience count defaults docs endpoint familysearch full function functions getmemories https includes list maximum memories memory number org paged params person person-memories-query photo promise response return start story type types url values"
    },
    {
      "section": "api",
      "id": "memories.functions:getPersonPortraitUrl",
      "shortName": "getPersonPortraitUrl",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get the URL of the portrait of a person.",
      "keywords": "api convenience default docs doesn endpoint exist familysearch function functions getportraiturl https includes memories org params person portrait promise redirect response url"
    },
    {
      "section": "api",
      "id": "memories.functions:getUserMemoriesQuery",
      "shortName": "getUserMemoriesQuery",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Get a paged list of memories for a user",
      "keywords": "api array convenience count defaults docs familysearch function functions getmemories https includes list maximum memories memory number org paged params promise response return start types user"
    },
    {
      "section": "api",
      "id": "memories.types:constructor.Memory",
      "shortName": "constructor.Memory",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Memory",
      "keywords": "__note__ _description_ _must_ access api appear apply array artifact artifactfilename artifacttype attributes attribution client comments contents create currently data data_ default delete deletememory description details docs document documents doesn endpoint existing familysearch field file filename formdata full function functions getabout getartifactfilename getartifactheight getartifactmetadata getartifacttype getartifactwidth getattribution getcomments getcommentsurl getdescription geticonurl getid getimageurl getmediatype getmemoryartifacturl getmemorycomments getmemoryurl getresourcetype getthumbnailurl gettitle height http https icon ignored image images media memories memory object optional org pass promise resource response save sdk setartifactfilename setdescription settitle stories story string thumbnail title token type types update updating upload uploaded url user width"
    },
    {
      "section": "api",
      "id": "memories.types:constructor.MemoryArtifactRef",
      "shortName": "constructor.MemoryArtifactRef",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Memory Artifact Reference",
      "keywords": "_description_ _qualifiername_ _qualifiervalue_ api artifact attributes bottom-right client comma-separated corresponding data familysearch function getdescription getid getqualifiername getqualifiervalue http memories memory memoryartifactref number numbers object optional org qualifier qualifiername qualifiervalue ranges reference required sdk set setqualifiername setqualifiervalue string top-left types url x-end x-start y-end y-start"
    },
    {
      "section": "api",
      "id": "memories.types:constructor.MemoryPersona",
      "shortName": "constructor.MemoryPersona",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Memory Persona (not a true persona; can only contain a name and a media artifact reference)",
      "keywords": "_name_ _note_ api artifact attributes client create data delete deletememorypersona display docs don endpoint existing familysearch full fulltext function functions getdisplayname getid getmemory getmemoryartifactref getmemorypersonaurl getmemoryurl getnames https isextracted media memories memory memoryartifactref memorypersona names object optional org parts persona personas promise reference response save sdk set setmemoryartifactref setname string surname true types update updated url useless"
    },
    {
      "section": "api",
      "id": "memories.types:constructor.MemoryPersonaRef",
      "shortName": "constructor.MemoryPersonaRef",
      "type": "function",
      "moduleName": "memories",
      "shortDescription": "Reference from a person to a memory persona",
      "keywords": "_memorypersona_ _note_ _refresh_ access api attributes client create created creating data delete deleted deletememorypersonaref details docs endpoint familysearch full function functions getid getmemory getmemorypersona getmemorypersonarefurl getmemorypersonaurl getmemoryurl getresource getresourceid https individual memories memory memorypersona memorypersonaref note object optional org parameter pass person persona promise read reference references response save sdk set setmemorypersona token types updated url"
    },
    {
      "section": "api",
      "id": "name",
      "shortName": "name",
      "type": "overview",
      "moduleName": "name",
      "shortDescription": "Name",
      "keywords": "api overview"
    },
    {
      "section": "api",
      "id": "name.functions:createName",
      "shortName": "createName",
      "type": "function",
      "moduleName": "name",
      "shortDescription": "Create a Name object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method object org types"
    },
    {
      "section": "api",
      "id": "name.types:constructor.Name",
      "shortName": "constructor.Name",
      "type": "function",
      "moduleName": "name",
      "shortDescription": "Name",
      "keywords": "__note__ api attributes attribution call change changed changemessage client created data defaults familysearch flag form forms full fulltext function getattribution getfulltext getgivenname getid getlang getnameform getnameformscount getnamepart getprefix getsuffix getsurname gettype givenname http initially ispreferred lang language message number object optional org parts person preferred prefix properties read read-only sdk set setchangemessage setfulltext setgivenname setnamepart setpreferred setprefix sets setsuffix setsurname settype string suffix surname text true type types update"
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
      "id": "notes.functions:createNote",
      "shortName": "createNote",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Create a Note object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method note notes object org types"
    },
    {
      "section": "api",
      "id": "notes.functions:deleteNote",
      "shortName": "deleteNote",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Delete the specified person note",
      "keywords": "api change changemessage delete docs familysearch full function functions https message note notes org person promise url"
    },
    {
      "section": "api",
      "id": "notes.functions:getMultiNote",
      "shortName": "getMultiNote",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get multiple notes at once by requesting them in parallel",
      "keywords": "api child couple docs fulfilled full function functions getnote https map multiple note notes org parallel parents person promise read relationship requesting responses returning url urls"
    },
    {
      "section": "api",
      "id": "notes.functions:getNote",
      "shortName": "getNote",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get information about a note",
      "keywords": "api child convenience couple docs full function functions getnote https includes note notes org parents person promise relationship response types url"
    },
    {
      "section": "api",
      "id": "notes.functions:getNotes",
      "shortName": "getNotes",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Get notes for a person, couple, or child and parents relationship",
      "keywords": "api array child child-and-parents-notes convenience couple couple-notes docs endpoint full function functions getnotes https includes note notes org parents person person-notes promise relationship response types url"
    },
    {
      "section": "api",
      "id": "notes.types:constructor.Note",
      "shortName": "constructor.Note",
      "type": "function",
      "moduleName": "notes",
      "shortDescription": "Note",
      "keywords": "access api attributes attribution change changemessage client create creating data delete endpoint existing familysearch function getid getnoteurl getsubject gettext list message note notes object optional promise read refresh response save sdk set subject text title token true types update url"
    },
    {
      "section": "api",
      "id": "ordinances",
      "shortName": "ordinances",
      "type": "overview",
      "moduleName": "ordinances",
      "shortDescription": "Functions for interacting with the FamilySearch Ordinance API",
      "keywords": "api docs familysearch functions https interacting ordinance ordinances org overview"
    },
    {
      "section": "api",
      "id": "ordinances.functions:getOrdinancesPolicy",
      "shortName": "getOrdinancesPolicy",
      "type": "function",
      "moduleName": "ordinances",
      "shortDescription": "Get the policy that must be agreed to by the user in order to reserve an LDS ordinance.",
      "keywords": "accept-language agreed api calling determines docs format function functions getdata header html https language lds order ordinance ordinances org policy promise reserve response retrieved text user"
    },
    {
      "section": "api",
      "id": "ordinances.functions:hasOrdinancesAccess",
      "shortName": "hasOrdinancesAccess",
      "type": "function",
      "moduleName": "ordinances",
      "shortDescription": "Determine whether the current user has access to LDS ordinances. The returned",
      "keywords": "access api current determine docs function functions https lds ordinances org promise rejected resolved response returned user"
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
      "id": "parentsAndChildren.functions:createChildAndParents",
      "shortName": "createChildAndParents",
      "type": "function",
      "moduleName": "parentsAndChildren",
      "shortDescription": "Create a ChildAndParents object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling childandparents create data directly function functions method object org parentsandchildren types"
    },
    {
      "section": "api",
      "id": "parentsAndChildren.functions:deleteChildAndParents",
      "shortName": "deleteChildAndParents",
      "type": "function",
      "moduleName": "parentsAndChildren",
      "shortDescription": "Delete the specified relationship",
      "keywords": "api changemessage child-and-parents delete deletion docs familysearch full function functions https org parentsandchildren promise reason relationship response url"
    },
    {
      "section": "api",
      "id": "parentsAndChildren.functions:getChildAndParents",
      "shortName": "getChildAndParents",
      "type": "function",
      "moduleName": "parentsAndChildren",
      "shortDescription": "Get information about a child and parents relationship.",
      "keywords": "access api child child-and-parents childandparents convenience docs familysearch full function functions getperson getrelationship https includes object org parameter params parents parentsandchildren person persons promise relationship response return set true types url"
    },
    {
      "section": "api",
      "id": "parentsAndChildren.functions:restoreChildAndParents",
      "shortName": "restoreChildAndParents",
      "type": "function",
      "moduleName": "parentsAndChildren",
      "shortDescription": "Restore a deleted child and parents relationship",
      "keywords": "api changemessage child child-and-parents deleted deletion docs familysearch full function functions https org parents parentsandchildren promise reason relationship response restore url"
    },
    {
      "section": "api",
      "id": "parentsAndChildren.types:constructor.ChildAndParents",
      "shortName": "constructor.ChildAndParents",
      "type": "function",
      "moduleName": "parentsAndChildren",
      "shortDescription": "Child and parents relationship",
      "keywords": "_child_ _delete_ _father_ _fatherfacts_ _mother_ _motherfacts_ _save_ add addfatherfact addmotherfact addnote addsource api array arrays attach attributes biologicalparent caprid change changed changehistory changemessage changes child child-and-parents childandparents client convenience count create created data dates default delete deletechildandparents deleted deletefather deletefatherfact deletemother deletemotherfact description docs doesn element endpoint entries exist existing fact facts familysearch father fatherfacts full function functions getchanges getchild getchildandparentsurl getchildid getchildurl getfather getfatherfacts getfatherid getfatherurl getid getmother getmotherfacts getmotherid getmotherurl getnotes getperson getsourcerefs getsources getsourcesquery headers history http https ids includes links longer message methods mother motherfacts note notes number object objects optional org params parent-relationship parents parentsandchildren passed persists person places promise reference relationship remove removes requests resolved response responses restore restorechildandparents return save saved sdk set setchild setfather setfatherfacts setmother setmotherfacts source sourcedescription sourceref sources supported tags type types update url urls"
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
      "keywords": "additional ancestor ancestors ancestry api array ascendancy convenience descendancy descendants display docs exists existsdescendant familysearch full function functions generation generations getascendancynumber getdescendancynumber getdescendant getperson getpersons https includes marriagedate marriagedetails marriageplace notes number object objects optionally org parameter params pedigree person persondetails persons pid promise response retrieve return returns set spouse true types"
    },
    {
      "section": "api",
      "id": "pedigree.functions:getDescendancy",
      "shortName": "getDescendancy",
      "type": "function",
      "moduleName": "pedigree",
      "shortDescription": "Get the descendants of a specified person and optionally a specified spouse with the following convenience functions",
      "keywords": "additional api array ascendancy convenience descendancy descendants descendency details display docs exists familysearch function functions generations getancestry getdescendancynumber getperson getpersons https includes marriage marriagedate marriagedetails marriageplace max notes null number object objects optionally org params pedigree person persondetails persons pid promise provide retrieve return returns set spouse true types unknown"
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
      "id": "person.functions:createPerson",
      "shortName": "createPerson",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Create a Person object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method object org person types"
    },
    {
      "section": "api",
      "id": "person.functions:deletePerson",
      "shortName": "deletePerson",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Delete the specified person.",
      "keywords": "api changemessage delete deletion docs familysearch full function functions https org person pid promise reason response url"
    },
    {
      "section": "api",
      "id": "person.functions:deletePreferredParents",
      "shortName": "deletePreferredParents",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Delete the preferred parents preference for this person and this user",
      "keywords": "api delete docs familysearch function functions https org parents person pid preference preferred promise response user"
    },
    {
      "section": "api",
      "id": "person.functions:deletePreferredSpouse",
      "shortName": "deletePreferredSpouse",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Delete the preferred spouse preference for this person and this user",
      "keywords": "api delete docs familysearch function functions https org person pid preference preferred promise response spouse user"
    },
    {
      "section": "api",
      "id": "person.functions:getMultiPerson",
      "shortName": "getMultiPerson",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get multiple people at once by requesting them in parallel",
      "keywords": "api array docs familysearch fulfilled function functions getperson https ids map multiple org parallel people person pids promise read requesting response returning urls"
    },
    {
      "section": "api",
      "id": "person.functions:getPerson",
      "shortName": "getPerson",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get the specified person",
      "keywords": "api array child childandparents children convenience couple deleted differ docs familysearch father full function functions getchildids getchildidsof getchildrelationships getchildrelationshipsof getchildren getchildrenof getfatherids getfathers getmotherids getmothers getparentrelationships getperson getprimaryid getprimaryperson getrequestedid getspouseids getspouserelationship getspouserelationships getspouses https ids includes merge mother null object objects org parameters parent parentsandchildren person persons pid primary promise query relationship relationships requested response return returned returns spouse spouseid spouses supported true types url wasredirected"
    },
    {
      "section": "api",
      "id": "person.functions:getPersonWithRelationships",
      "shortName": "getPersonWithRelationships",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "This method is deprecated as of March 2017. ",
      "keywords": "__ __this addition api array child childandparents children convenience couple deleted deprecated differ docs familysearch father full function functions getchildids getchildidsof getchildrelationships getchildrelationshipsof getchildren getchildrenof getfatherids getfathers getmotherids getmothers getparentrelationships getperson getprimaryid getprimaryperson getrequestedid getspouseids getspouserelationship getspouserelationships getspouses https ids march merge method mother null object objects org params parent parents parentsandchildren person persons pid primary promise relationship relationships relative requested response retrieve return returned returns set spouse spouseid spouses true types wasredirected"
    },
    {
      "section": "api",
      "id": "person.functions:getPreferredParents",
      "shortName": "getPreferredParents",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get the preferred ChildAndParents relationship id if any for this person and this user.",
      "keywords": "api childandparents convenience currently docs familysearch function functions getpreferredparents https org params person pid preference preferred promise relationship response returns undefined unused url user"
    },
    {
      "section": "api",
      "id": "person.functions:getPreferredSpouse",
      "shortName": "getPreferredSpouse",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Get the preferred Couple relationship id if any for this person and this user.",
      "keywords": "api convenience couple docs familysearch function functions getpreferredspouse https null org person pid preference preferred promise relationship response returns spouse undefined unknown url user"
    },
    {
      "section": "api",
      "id": "person.functions:setPreferredParents",
      "shortName": "setPreferredParents",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Set the preferred parents for this person and this user",
      "keywords": "api childandparents curl docs familysearch function functions https org parents person pid preferred promise relationship response set url user"
    },
    {
      "section": "api",
      "id": "person.functions:setPreferredSpouse",
      "shortName": "setPreferredSpouse",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Set the preferred spouse for this person and this user",
      "keywords": "api child couple curl docs familysearch function functions https missing org parents pass person pid preferred promise relationship response set spouse url user"
    },
    {
      "section": "api",
      "id": "person.types:constructor.Person",
      "shortName": "constructor.Person",
      "type": "function",
      "moduleName": "person",
      "shortDescription": "Person",
      "keywords": "__ __this _delete_ _facts_ _gender_ _names_ _save_ add adddiscussion addfact addname addnote addsource ancestor ancestry api array arrays attach attributes birth birthdate birthplace burial change changehistory changemessage changes child childandparents children christening christning client conslusions convenience count couple couples create created data death deathdate deathplace default delete deleted deletefact deletename deleteperson deprecated descendency description discussion discussionref discussions display docs doesn element endpoint entries exist existing exists explicit fact facts false familysearch female final follow followredirect full function functions gender generations getancestry getbirth getbirthdate getbirthplace getburial getburialdate getburialplace getchanges getchildandparentsrelationships getchildrelationships getchildren getchristening getchristeningdate getchristeningplace getcouplerelationships getdeath getdeathdate getdeathplace getdescendancy getdiscussionrefs getdisplay getdisplaybirthdate getdisplaybirthplace getdisplaydeathdate getdisplaydeathplace getdisplaygender getdisplaylifespan getdisplayname getfact getfacts getgender getgivenname getid getidentifiers getmatches getmemorypersonarefs getnames getnotes getparentrelationships getparents getpersistentidentifier getperson getpersonchanges getpersondiscussionrefs getpersonmatches getpersonportraiturl getpersonurl getpersonwithrelationships getpreferredname getrecordmatches getsourcerefs getsources getsourcesquery getspouserelationships getspouses getsurname headers history http https identifier identifiers implied include includes isliving isreadonly lifespan links male map march matter max memories message method methods multiple names needed note notes number object objects optional org param parameter params parent parents parentsandchildren pass passed pedigree people persistent persists person persondetails persons pid place portrait preferred promise promises read read-only redirect reference relationship relationships remove removes request requests resolved resolves response responses restore retrieve return returned returns save sdk searchandmatch set setfacts setgender setnames source sourcedescription sourceref sources spouse spouses string strings surname tags true type types update updated url values year"
    },
    {
      "section": "api",
      "id": "places",
      "shortName": "places",
      "type": "overview",
      "moduleName": "places",
      "shortDescription": "Functions for interacting with the FamilySearch Place Authority",
      "keywords": "api authority docs familysearch functions https interacting org overview place places"
    },
    {
      "section": "api",
      "id": "places.functions:createPlaceDescription",
      "shortName": "createPlaceDescription",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Create a PlaceDescription object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method object org placedescription places types"
    },
    {
      "section": "api",
      "id": "places.functions:createPlaceReference",
      "shortName": "createPlaceReference",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Create a PlaceReference object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method object org placereference places types"
    },
    {
      "section": "api",
      "id": "places.functions:createPlacesSearchResult",
      "shortName": "createPlacesSearchResult",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Create a PlacesSearchResult object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method object org places placessearchresult types"
    },
    {
      "section": "api",
      "id": "places.functions:createTextValue",
      "shortName": "createTextValue",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Create a TextValue object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method object org places textvalue types"
    },
    {
      "section": "api",
      "id": "places.functions:getPlace",
      "shortName": "getPlace",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Get a place.",
      "keywords": "api docs full function functions getplace https org place placedescription places promise response types url"
    },
    {
      "section": "api",
      "id": "places.functions:getPlaceDescription",
      "shortName": "getPlaceDescription",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Get a place.",
      "keywords": "api description docs full function functions getplacedescription https org place placedescription places promise response types url"
    },
    {
      "section": "api",
      "id": "places.functions:getPlaceDescriptionChildren",
      "shortName": "getPlaceDescriptionChildren",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Get the children of a Place Description. Use getPlacesSearch() to filter by type, date, and more.",
      "keywords": "api array children description descriptions docs endpoint filter full function functions getchildren getplacessearch https org place placedescription placedescriptions places promise response type types url"
    },
    {
      "section": "api",
      "id": "places.functions:getPlacesSearch",
      "shortName": "getPlacesSearch",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Search for a place.",
      "keywords": "__search api array count description details distance docs function functions getsearchresults https latitude longitude number org parameters parameters__ parentid partialname place places placessearchresult placessearchresults promise read response result search start typegroupid typeid types"
    },
    {
      "section": "api",
      "id": "places.functions:getPlaceType",
      "shortName": "getPlaceType",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Get a place.",
      "keywords": "api docs function functions getplacetype https org place places promise response types vocabularies vocabularyelement"
    },
    {
      "section": "api",
      "id": "places.functions:getPlaceTypeGroup",
      "shortName": "getPlaceTypeGroup",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Get a Place Type Group which includes a list of Places Types in the group.",
      "keywords": "api array docs function functions getlist getplacetypes group https includes list org place places promise response type types vocabularies vocabularyelement vocabularyelements vocabularylist"
    },
    {
      "section": "api",
      "id": "places.functions:getPlaceTypeGroups",
      "shortName": "getPlaceTypeGroups",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Get a list of all available Place Types.",
      "keywords": "api array docs function functions getlist getplacetypegroups https list org place places promise response types vocabularies vocabularyelement vocabularyelements vocabularylist"
    },
    {
      "section": "api",
      "id": "places.functions:getPlaceTypes",
      "shortName": "getPlaceTypes",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Get a list of all available Place Types.",
      "keywords": "api array docs function functions getlist getplacetypes https list org place places promise response types vocabularies vocabularyelement vocabularyelements vocabularylist"
    },
    {
      "section": "api",
      "id": "places.types:constructor.PlaceDescription",
      "shortName": "constructor.PlaceDescription",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Place description returned by the Place Authority.",
      "keywords": "access angular api array arrays attributes authority chain client data degrees description descriptions details display distance equator fail familysearch full fullname fully function functions getdisplay getfullname getid getidentifiers getjurisdictiondetails getjurisdictionsummary getlang getlatitude getlongitude getname getnames getplacedescriptionurl gettemporaldescription gettype gettypeuri identifiers identify ids includes json jurisdiction jursdiction jursdictions jursidication language listed map meridian names north object org parent period place placedescription places preferred prime promise properties qualified range raw relative relevant representing response retrieving returned sdk setjurisdiction south summary time token type types uri url values w3"
    },
    {
      "section": "api",
      "id": "places.types:constructor.PlaceReference",
      "shortName": "constructor.PlaceReference",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Place reference as used in Facts.",
      "keywords": "api client data facts familysearch function getnormalized getoriginal normalized object original place placereference places raw reference sdk setoriginal types"
    },
    {
      "section": "api",
      "id": "places.types:constructor.PlacesSearchResult",
      "shortName": "constructor.PlacesSearchResult",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "A places search result entry.",
      "keywords": "api better client data description entry familysearch function getid getplace getscore higher object place placedescription places placessearchresult raw result sdk search types"
    },
    {
      "section": "api",
      "id": "places.types:constructor.TextValue",
      "shortName": "constructor.TextValue",
      "type": "function",
      "moduleName": "places",
      "shortDescription": "Place description returned by the Place Authority.",
      "keywords": "api authority client data description familysearch function getlang getvalue language object org place places raw returned sdk text textvalue types w3"
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
      "keywords": "api behaves call delete endpoint familysearch function functions headers http init low-level options plumbing promise promises relative rest returned specific url"
    },
    {
      "section": "api",
      "id": "plumbing.functions:get",
      "shortName": "get",
      "type": "function",
      "moduleName": "plumbing",
      "shortDescription": "Low-level call to get a specific REST endpoint from FamilySearch",
      "keywords": "api behaves call endpoint familysearch function functions headers http init low-level options parameters params plumbing promise promises query relative rest returned specific url"
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
      "keywords": "api behaves call data delete endpoint familysearch function functions headers http init issue low-level method number object plumbing post promise promises relative request rest retries retry returned specific times url"
    },
    {
      "section": "api",
      "id": "plumbing.functions:post",
      "shortName": "post",
      "type": "function",
      "moduleName": "plumbing",
      "shortDescription": "Low-level call to post to a specific REST endpoint from FamilySearch",
      "keywords": "api behaves call data endpoint familysearch function functions headers http init low-level options plumbing post promise promises relative rest returned specific url"
    },
    {
      "section": "api",
      "id": "plumbing.functions:put",
      "shortName": "put",
      "type": "function",
      "moduleName": "plumbing",
      "shortDescription": "Low-level call to put to a specific REST endpoint from FamilySearch",
      "keywords": "api behaves call data endpoint familysearch function functions headers http init low-level options plumbing post promise promises relative rest returned specific url"
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
      "id": "searchAndMatch.functions:createSearchResult",
      "shortName": "createSearchResult",
      "type": "function",
      "moduleName": "searchAndMatch",
      "shortDescription": "Create a SearchResult object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method object org searchandmatch searchresult types"
    },
    {
      "section": "api",
      "id": "searchAndMatch.functions:getPersonMatches",
      "shortName": "getPersonMatches",
      "type": "function",
      "moduleName": "searchAndMatch",
      "shortDescription": "Get the matches (possible duplicates) for a person. Set the collection query",
      "keywords": "api array collection convenience docs duplicates endpoint familysearch full function functions getindex getresultscount getsearchresults hints https includes matches number org parameter parameters params person person-matches promise query record response search searchandmatch searchresult searchresults set starting supported total types url"
    },
    {
      "section": "api",
      "id": "searchAndMatch.functions:getPersonMatchesQuery",
      "shortName": "getPersonMatchesQuery",
      "type": "function",
      "moduleName": "searchAndMatch",
      "shortDescription": "Get matches for someone not in the tree",
      "keywords": "api array assist candidateid context convenience described differences docs familysearch fatherid finding function functions generally getindex getpersonsearch getresultscount getsearchresults https includes match matched matches motherid number org parameter parameters params people person promise relatives response restricts search searchandmatch searchresult searchresults spouseid starting total tree types valid"
    },
    {
      "section": "api",
      "id": "searchAndMatch.functions:getPersonSearch",
      "shortName": "getPersonSearch",
      "type": "function",
      "moduleName": "searchAndMatch",
      "shortDescription": "Search people",
      "keywords": "additional allows api append array birthdate birthplace context convenience count dates deathdate deathplace described docs familysearch father female full function functions gender getcontext getindex getresultscount getsearchresults givenname https includes list male marriagedate marriageplace matches mother non-exact number org parameter parameters params pass people places promise requests response result returned search searchandmatch searchresult searchresults spouse start starting subsequent surname tilde token total types work works"
    },
    {
      "section": "api",
      "id": "searchAndMatch.types:constructor.SearchResult",
      "shortName": "constructor.SearchResult",
      "type": "function",
      "moduleName": "searchAndMatch",
      "shortDescription": "A person search result entry.",
      "keywords": "api array aware better child client data entry familysearch father function functions getchildids getchildren getconfidence getfatherids getfathers getfullprimaryperson getid getmotherids getmothers getperson getprimaryperson getscore getspouseids getspouses gettitle higher mother object objects pedigree person persons pid primary promise raw response result returned sdk search searchandmatch searchresult searchresults spouse types"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:createCollection",
      "shortName": "createCollection",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Create a Collection object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling collection create data directly function functions method object org sourcebox types"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:deleteCollection",
      "shortName": "deleteCollection",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Delete the specified collection",
      "keywords": "api collection delete docs familysearch full function functions https org promise response sourcebox url"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:getCollection",
      "shortName": "getCollection",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Get information about a user-defined collection",
      "keywords": "api collection convenience docs familysearch full function functions getcollection https includes org promise response sourcebox types url user-defined"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:getCollectionsForUser",
      "shortName": "getCollectionsForUser",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Get the collections for the current user",
      "keywords": "api array collection collections convenience current docs familysearch function functions getcollections https includes org promise response sourcebox types user"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:getCollectionSourceDescriptions",
      "shortName": "getCollectionSourceDescriptions",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Get a paged list of source descriptions in a user-defined collection",
      "keywords": "api array collection collection-source-descriptions convenience count descriptions docs endpoint familysearch full function functions getsourcedescriptions https includes list maximum org paged params promise response return source sourcebox sourcedescription sourcedescriptions sources start types url user-defined zero-based"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:getCollectionSourceDescriptionsForUser",
      "shortName": "getCollectionSourceDescriptionsForUser",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Get a paged list of source descriptions in all user-defined collections defined by a user",
      "keywords": "api array collections convenience count defined descriptions docs familysearch function functions getsourcedescriptions https includes list maximum org paged params promise response return source sourcebox sourcedescription sourcedescriptions sources start types user user-defined zero-based"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:moveSourceDescriptionsToCollection",
      "shortName": "moveSourceDescriptionsToCollection",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Move the specified source descriptions to the specified collection",
      "keywords": "api array collection descriptions docs endpoint familysearch full function functions https move objects org promise response source sourcebox srcdescs url"
    },
    {
      "section": "api",
      "id": "sourceBox.functions:removeSourceDescriptionsFromCollections",
      "shortName": "removeSourceDescriptionsFromCollections",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Remove the specified source descriptions from all collections",
      "keywords": "api array collections descriptions docs familysearch function functions https objects org promise remove response source sourcebox srcdescs"
    },
    {
      "section": "api",
      "id": "sourceBox.types:constructor.Collection",
      "shortName": "constructor.Collection",
      "type": "function",
      "moduleName": "sourceBox",
      "shortDescription": "Collection",
      "keywords": "api attribution client collection count create data delete deletecollection descriptions docs empty familysearch function functions getattribution getcollectionsourcedescriptions getcollectionurl getid getsize getsourcedescriptions gettitle https maximum number object org params person promise raw response return save sdk source sourcebox sources start title types url user-defined zero-based"
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
      "id": "sources.functions:createSourceDescription",
      "shortName": "createSourceDescription",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Create a SourceDescription object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method object org sourcedescription sources types"
    },
    {
      "section": "api",
      "id": "sources.functions:createSourceRef",
      "shortName": "createSourceRef",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Create a SourceRef object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method object org sourceref sources types"
    },
    {
      "section": "api",
      "id": "sources.functions:deleteSourceDescription",
      "shortName": "deleteSourceDescription",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Delete the specified source description as well as all source references that refer to it",
      "keywords": "__note__ api automatically aware changemessage committed delete deletion description docs familysearch full function functions hasn https issue org promise reason refer references response source sources url"
    },
    {
      "section": "api",
      "id": "sources.functions:deleteSourceRef",
      "shortName": "deleteSourceRef",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Delete the specified source reference",
      "keywords": "api changemessage child couple delete deletion docs function functions https org parents person promise reason reference response source sources url"
    },
    {
      "section": "api",
      "id": "sources.functions:getMultiSourceDescription",
      "shortName": "getMultiSourceDescription",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get multiple source descriptions at once by requesting them in parallel",
      "keywords": "api description descriptions docs familysearch fulfilled full function functions getsourcedescription https map multiple org parallel promise read requesting response returning source sources url urls"
    },
    {
      "section": "api",
      "id": "sources.functions:getSourceAttachments",
      "shortName": "getSourceAttachments",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get the people, couples, and child-and-parents relationships that have the",
      "keywords": "api array attached attachments child child-and-parents convenience couple couples description docs existing familysearch function functions getchildandparentssourcerefs getcouplesourcerefs getpersonsourcerefs getsourcedescription getsourcedescriptions getsourcerefsquery https includes method org parameter parent people person promise query references relationship relationships resource response source sourcedescription sourcedescriptions sourceref sourcerefs sources types url"
    },
    {
      "section": "api",
      "id": "sources.functions:getSourceDescription",
      "shortName": "getSourceDescription",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get information about a source",
      "keywords": "api convenience description docs familysearch full function functions getsourcedescription https includes org promise response source sourcedescription sources types url"
    },
    {
      "section": "api",
      "id": "sources.functions:getSourceRefs",
      "shortName": "getSourceRefs",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "This method is deprecated as of March 2017. Use getPerson() to retrieve source references.",
      "keywords": "__ __this api array child convenience couple deprecated docs endpoint full function functions getperson getsourcerefs https includes march method org parents person promise references response retrieve source source-references sourceref sourcerefs sources types url"
    },
    {
      "section": "api",
      "id": "sources.functions:getSourceRefsQuery",
      "shortName": "getSourceRefsQuery",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get the people, couples, and child-and-parents relationships referencing a source description.",
      "keywords": "api array attachments child child-and-parents convenience couple couples description docs familysearch function functions getchildandparentssourcerefs getcouplesourcerefs getpersonsourcerefs getsourceattachments https includes method org parameter parent people person promise query references referencing relationship relationships resource response source sourceref sourcerefs sources types url"
    },
    {
      "section": "api",
      "id": "sources.functions:getSourcesQuery",
      "shortName": "getSourcesQuery",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Get source references and descriptions for a person, couple, or child and parents.",
      "keywords": "api array child convenience couple description descriptions docs endpoint full function functions getsourcedescription getsourcedescriptions getsourcerefs https includes org parents person promise query references response source sourcedescription sourcedescriptions sourceref sourcerefs sources sources-query types url"
    },
    {
      "section": "api",
      "id": "sources.types:constructor.SourceDescription",
      "shortName": "constructor.SourceDescription",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Description of a source",
      "keywords": "_about_ api attribution change changemessage citation client create data delete deletesourcedescription deletion description docs existing familysearch function functions getabout getattribution getcitation getid getsourcedescriptionurl getsourcerefsquery gettext gettitle https memory message object org promise reason record refer references response save sdk setcitation settext settitle source sourcedescription sources text title types update url"
    },
    {
      "section": "api",
      "id": "sources.types:constructor.SourceRef",
      "shortName": "constructor.SourceRef",
      "type": "function",
      "moduleName": "sources",
      "shortDescription": "Reference from a person or relationship to a source.",
      "keywords": "_note_ _refresh_ add addtag api array attached attribution change changemessage child childandparents client couple create creating data delete deletechildandparentssourceref deletecouplesourceref deletepersonsourceref deletion description details docs endpoint entityid entityurl existing familysearch fulfilled function functions getattachedentityid getattachedentityurl getattribution getdescription getid getsourcedescription getsourcedescriptionid getsourcedescriptionurl getsourcerefurl gettags http https individual message object org parameter parents pass person promise raw read reason reference references relationship remove removetag response save sdk set setattachedentityid setattachedentityurl setsourcedescription settags source sourcedescription sourceref sources srcdesc tag tags type types update updateable updated url"
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
      "id": "spouses.functions:createCouple",
      "shortName": "createCouple",
      "type": "function",
      "moduleName": "spouses",
      "shortDescription": "Create a Couple object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling couple create data directly function functions method object org spouses types"
    },
    {
      "section": "api",
      "id": "spouses.functions:deleteCouple",
      "shortName": "deleteCouple",
      "type": "function",
      "moduleName": "spouses",
      "shortDescription": "Delete the specified relationship",
      "keywords": "api changemessage couple delete deletion docs familysearch full function functions https org promise reason relationship response spouses url"
    },
    {
      "section": "api",
      "id": "spouses.functions:getCouple",
      "shortName": "getCouple",
      "type": "function",
      "moduleName": "spouses",
      "shortDescription": "Get information about a couple relationship",
      "keywords": "access api convenience couple docs familysearch full function functions getperson getrelationship https includes object org parameter params person persons promise relationship response return set spouses true types url"
    },
    {
      "section": "api",
      "id": "spouses.functions:restoreCouple",
      "shortName": "restoreCouple",
      "type": "function",
      "moduleName": "spouses",
      "shortDescription": "Restore a deleted couple relationship",
      "keywords": "api couple crid deleted docs familysearch full function functions https org promise relationship response restore spouses url"
    },
    {
      "section": "api",
      "id": "spouses.types:constructor.Couple",
      "shortName": "constructor.Couple",
      "type": "function",
      "moduleName": "spouses",
      "shortDescription": "Couple relationship",
      "keywords": "_delete_ _facts_ _husband_ _save_ _wife_ add addfact addnote addsource api array attach attributes call change changehistory changemessage changes client convenience count couple create data default delete deletecouple deleted deletefact description docs doesn elements entries exist existing exports fact facts familysearch fetch function functions getchanges getcouplesourcerefs getcoupleurl getfacts gethusband gethusbandid gethusbandurl getid getmarriagefact getnotes getperson getsourcerefs getsources getsourcesquery getspouse getspouseid getspouseurl getwife getwifeid getwifeurl history http https husband ids includes initializing marriage message method methods multiple note notes number object objects optional org params pass passed persists person plan promise reference relationship remove removes resolves response responses restore restorecouple return save sdk seconds set setfacts sethusband setwife source sourcedescription sourceref sources spouse spouses tags type types update url urls wife"
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
      "id": "user.functions:createAgent",
      "shortName": "createAgent",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "Create an Agent object. Use this method instead of calling the constructor directly.",
      "keywords": "agent api calling create data directly function functions method object org types user"
    },
    {
      "section": "api",
      "id": "user.functions:createUser",
      "shortName": "createUser",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "Create a User object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions method object org types user"
    },
    {
      "section": "api",
      "id": "user.functions:getAgent",
      "shortName": "getAgent",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "Get information about the specified agent (contributor)",
      "keywords": "agent api convenience docs familysearch full function functions getagent https includes org response types url user"
    },
    {
      "section": "api",
      "id": "user.functions:getCurrentUser",
      "shortName": "getCurrentUser",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "Get the current user with the following convenience function",
      "keywords": "api convenience current docs familysearch function functions getuser https org promise response types user"
    },
    {
      "section": "api",
      "id": "user.functions:getCurrentUserPerson",
      "shortName": "getCurrentUserPerson",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "Get the tree person that represents the current user.",
      "keywords": "api current docs familysearch function functions getperson https org person promise represents response tree types user"
    },
    {
      "section": "api",
      "id": "user.functions:getMultiAgent",
      "shortName": "getMultiAgent",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "Get multiple agents at once by requesting them in parallel",
      "keywords": "agent agents api array docs familysearch fulfilled full function functions getagent https map multiple org parallel promise read requesting response returning urls user"
    },
    {
      "section": "api",
      "id": "user.types:constructor.Agent",
      "shortName": "constructor.Agent",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "An agent is returned from getAgent.",
      "keywords": "account address agent api client contact contributor data email familysearch function functions getaccountname getaddress getagent getemail getid getname getphonenumber ids number object phone postal raw returned sdk types user"
    },
    {
      "section": "api",
      "id": "user.types:constructor.User",
      "shortName": "constructor.User",
      "type": "function",
      "moduleName": "user",
      "shortDescription": "User - a user is returned from getCurrentUser;",
      "keywords": "address agent api client contact contributor data display email en family familysearch female full function functions getcontactname getcurrentuser getdisplayname getemail getfamilyname getgender getgivenname getid getpersonid getpreferredlanguage gettreeuserid ids male object person raw returned sdk types user"
    },
    {
      "section": "api",
      "id": "utilities",
      "shortName": "utilities",
      "type": "overview",
      "moduleName": "utilities",
      "shortDescription": "Utility functions",
      "keywords": "api docs familysearch functions https org overview utilities utility"
    },
    {
      "section": "api",
      "id": "utilities.functions:getPendingModifications",
      "shortName": "getPendingModifications",
      "type": "function",
      "moduleName": "utilities",
      "shortDescription": "Get a list of the pending modifications for the API.",
      "keywords": "api array convenience docs familysearch function functions getpendingmodifications https includes list modifications org pending promise response utilities"
    },
    {
      "section": "api",
      "id": "utilities.functions:getRedirectUrl",
      "shortName": "getRedirectUrl",
      "type": "function",
      "moduleName": "utilities",
      "shortDescription": "FamilySearch API Docs",
      "keywords": "access api changes context docs familysearch function functions https location memories ordinances org params person precedence redirect token uri url user utilities"
    },
    {
      "section": "api",
      "id": "vocabularies.functions:createVocabularyElement",
      "shortName": "createVocabularyElement",
      "type": "function",
      "moduleName": "vocabularies",
      "shortDescription": "Create a VocabularyElement object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly element function functions method object types vocabularies vocabulary vocabularyelement"
    },
    {
      "section": "api",
      "id": "vocabularies.functions:createVocabularyList",
      "shortName": "createVocabularyList",
      "type": "function",
      "moduleName": "vocabularies",
      "shortDescription": "Create a VocabularyList object. Use this method instead of calling the constructor directly.",
      "keywords": "api calling create data directly function functions list method object types vocabularies vocabulary vocabularylist"
    },
    {
      "section": "api",
      "id": "vocabularies.types:constructor.VocabularyElement",
      "shortName": "constructor.VocabularyElement",
      "type": "function",
      "moduleName": "vocabularies",
      "shortDescription": "An element in a vocabulary list.",
      "keywords": "api client data description element familysearch function getdescription getid getlabel label list object place raw sdk types vocabularies vocabulary vocabularyelement"
    },
    {
      "section": "api",
      "id": "vocabularies.types:constructor.VocabularyList",
      "shortName": "constructor.VocabularyList",
      "type": "function",
      "moduleName": "vocabularies",
      "shortDescription": "A vocabulary list.",
      "keywords": "api array client data description element familysearch function getdescription getelements gettitle label list object raw sdk types vocabularies vocabulary vocabularyelement vocabularyelements vocabularylist"
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