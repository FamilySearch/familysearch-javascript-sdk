A high-level javascript wrapper around the FamilySearch REST API.

[![Build Status](https://travis-ci.org/rootsdev/familysearch-javascript-sdk.png)](https://travis-ci.org/rootsdev/familysearch-javascript-sdk)
[![Stories in Ready](https://badge.waffle.io/rootsdev/familysearch-javascript-sdk.png?label=ready)](https://waffle.io/rootsdev/familysearch-javascript-sdk)

Overview
========

* Javascript functions wrap the underlying REST API calls.
The objects returned by the functions include convenience functions for extracting information from the returned JSON.
For example, the following logs the name of a person along with their spouses and chilren.
<pre>
FamilySearch.getPersonWithRelationships('KW7S-VQJ', {persons:true}).then(function(response) {
   console.log(response.getPrimaryPerson().getName());
   var spouses = response.getSpouses();
   for (var s = 0; spousesLen = spouses.length; s &lt; spousesLen; s++) {
      console.log(spouses[s].getName());
      var children = response.getChildren(spouses[s].getId());
      for (var c = 0; childrenLen = children.length; c &lt; childrenLen; c++) {
         console.log(children[c].getName());
      }
   }
});
</pre>

* Asynchronous functions (like the one above) return promises to make it easy for you to refer to their results from anywhere in your code.

* Each function is [well-documented](http://rootsdev.org/familysearch-javascript-sdk)
and has an editable jsFiddle to demonstrate its functionality and allow you to experiment.

* Authentication is handled using a popup window.  You do not need to create an OAuth redirect page.
All you need to do is register a callback URI that shares the same hostname and port as your code.
Check out the [jsFiddle](http://jsfiddle.net/DallanQ/MpUg7/) to see it in action (requires you to have a sandbox account).

* Option to store access token in a session cookie.

* Retry in the case of throttled responses is handled for you.

* Cross-platform: the SDK currently depends upon jQuery, but soon you will be able to substitute AngularJS or Node.js.

* Modular: the SDK can be called from AMD (RequireJS), CommonJS (Node.js), or browser global environments.

Download
========

The SDK is in the early stages and the calls may change somewhat. Once the SDK stablizes, which it should by the
end of the year, I will add semantic version numbering to the downloads. Once we get 100 people watching the repo,
[cdnJS](http://cdnjs.com/) will host it.

[familysearch-javascript-sdk.js](http://rootsdev.org/familysearch-javascript-sdk/familysearch-javascript-sdk.js)

[familysearch-javascript-sdk.min.js](http://rootsdev.org/familysearch-javascript-sdk/familysearch-javascript-sdk.min.js)

Documentation
=============

[API docs](http://rootsdev.org/familysearch-javascript-sdk)

Roadmap
=======

####Milestone 1 - December 24, 2013
* Create functions for basic read operations
* Make the SDK work with jQuery, AngularJS, and Node.js

####Milestone 2 - Feb 5, 2014
* Create an example application showing how to use the SDK.

####Milestone 3 - Feb 28, 2014
* Create functions for the basic create, update, and delete operations
