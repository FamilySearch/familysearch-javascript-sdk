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

* Cross-platform: the SDK works with jQuery or AngularJS, and soon Node.js.

* Object-oriented: SDK functions return objects, which have convenience functions to make getting or setting data easy.

* Consistent update API: each object has $save and $delete functions to persist changes or delete the object respectively.

* Modular: the SDK can be called from AMD (RequireJS), CommonJS (Node.js), or browser global environments.

Installation
============

You can install using bower:

    bower install familysearch-javascript-sdk

or by downloading one of the following files:

[familysearch-javascript-sdk.js](http://rootsdev.org/familysearch-javascript-sdk/familysearch-javascript-sdk.js)

[familysearch-javascript-sdk.min.js](http://rootsdev.org/familysearch-javascript-sdk/familysearch-javascript-sdk.min.js)

In the future, once we get 100 people watching the repo,
[cdnJS](http://cdnjs.com/) will host it.

Documentation
=============

* [API docs](http://rootsdev.org/familysearch-javascript-sdk)
* [Slides from 2014 RootsTech talk](http://dallanq.github.io/rootstech-2014-fs-js-sdk-slides).

Roadmap
=======

####Milestone 1 - complete
* Create functions for basic read operations
* Make the SDK work with jQuery and AngularJS

####Milestone 2 - complete
* Create an example application (RootSnap) showing how to use the SDK.

####Milestone 3 - complete
* Create functions for the basic create, update, and delete operations

####Milestone 4 - June 1, 2014
* All functions implemented, end-to-end tests in place, Node.js support, available in bower & npm repositories.
