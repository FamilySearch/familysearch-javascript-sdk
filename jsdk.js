/*!
 * FamilySearch JavaScript SDK
 * Copyright 2012, Dallan Quass & Dovy Paukstys
 * For all api documentation:
 * https://familysearch.org/developers/
*/

;(function(){

	// The FamilySearch namespace
	var FamilySearch = {
		
		// current version
		Version: '0.1.0',
		
		_appid 			: null,
		_status 		: null, // unknown, authorized or unauthorized
		_logging		: false,
		_cookies		: false,
		_code 			: null,
		_access_token 	: null,
		_auth_callback  : '',
		_api_format 	: '.json',
		_environment 	: 'staging',
		_host : {
			sandbox 	: 'https://sandbox.familysearch.org',
			staging		: 'https://stage.familysearch.org',
			production 	: 'https://familysearch.org'
		},
		_oauth: {
			sandbox 	: 'https://sandbox.familysearch.org/cis-web/oauth2/v3',
			staging 	: 'https://identbeta.familysearch.org/cis-web/oauth2/v3',
			production 	: 'https://ident.familysearch.org/cis-web/oauth2/v3',
		},
		_url: {
			api			: '/platform',
			status		: '/users/current',
			connect		: '/authorization',
			token		: '/token',
			disconnect	: '/oauth/deauthorize',
			logout		: '/oauth/logout'
		},
		
		// creates a quick and dirty unique id for use in states
		uuid:function() {
			return 'g' + (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		},
		
		// log messages for debugging, off by default
		log:function() {
			if(this._logging) {
				var args = Array.prototype.slice.call(arguments, 0) || [];
				if (window.console) window.console.log.apply(window.console,args);
				if (FamilySearch.Event) FamilySearch.Event.trigger.apply(FamilySearch.Event,['log'].concat(args));
			}
		},
		
		// Initialize the FamilySearch SDK library
		// The best place to put this code is right before the closing </body> tag
		//      
		//   FamilySearch.init({
		//   	 appId  			: 'YOUR APP KEY',							// app id or app key
		//	   access_token : 'YOUR ACCESS TOKEN',				// set the access token if you already have it
		//   	 host 				: 'http://sandbox.familysearch.com', 	// change host if needed
		//   	 cookies 			: true,												// enable cookies to allow the server to access the session
		//		 logging  		: true												// enable log messages to help in debugging
		//   });
		//
		init:function(opts,cb) {
			opts || (opts = {});
			if(!opts.app_id) {
				return FamilySearch.log('FamilySearch Javascript SDK requires an Application ID');
			}
			this._appid 		= opts.app_id;
			if(!opts.environment) {
				return FamilySearch.log('Setting the API environment to be: ' + opts.environment);
			}
			this._environment 		= opts.environment;			
			
			// authorize app if we already have an access token
			if(opts.access_token) {
				console.log('access token in INIT');
				this._access_token 	= opts.access_token;
				this._status = "authorized";
			}

			// set the callback URL
			if(opts.auth_callback) {
				this._auth_callback = opts.auth_callback;
			}
			
			this._logging 	= (window.location.toString().indexOf('familysearch_debug=1') > 0)  || opts.logging || this._logging;
			this._cookies 	= opts.cookies 	|| this._cookies;
			this._host 		= opts.host 	|| this._host;
			
			// oAuth callback function
			if ( (window.location.toString().indexOf('state=') > 0) ) {
				var u = window.location.toString().split('?');
				(window.opener || window.parent || window.top).postMessage(u[1], u[0]);	
			}

			return this;
		}

	}

	
	// Helper methods to make things easier
	FamilySearch.Util = {
	
		// Extend an object with all the properties of the passed object
		extend:function extend(destination, source) {
			for (var property in source) 
				destination[property] = source[property];
			return destination;
		},
		
		// Create a URL-encoded query string from an object
		encodeQueryString:function(obj,prefix){
			var str = [];
			for(var p in obj) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			return str.join("&");
		},
		
		// Parses a query string and returns an object composed of key/value pairs
		decodeQueryString:function(qs){
			qs = qs.replace('?','&');
			var
				obj = {},
				segments = qs.split('&'),
				kv;
			for (var i=0; i<segments.length; i++) {
				kv = segments[i].split('=', 2);
				if (kv && kv[0]) {
					obj[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
				}
			}
			return obj;
		},

		// Properly parse JSON without the need of an external library
		parseJSON:function(data) {
    		return window.JSON && window.JSON.parse ? window.JSON.parse( data ) : (new Function("return " + data))(); 
		}
	
	}
	
  //  FamilySearch custom events. You may 'bind' or 'unbind' a state function to an event;
  // 'triggering'-ing an event fires all states in succession.
  //
  //		function showStatus(status){
  //			alert(status)
  //		}
  //    FamilySearch.Event.bind('auth:statusChange', showStatus);
  //    FamilySearch.Event.trigger('auth:statuschange','authorized');
  //		FamilySearch.Event.unbind('auth:statusChange', showStatus);
  //
	FamilySearch.Event = {

		_events:{},

		// Bind an event, specified by a string name, 'event', to a state, 'cb', function.
		bind: function(event, cb){
			this._events[event] = this._events[event]	|| [];
			this._events[event].push(cb);
		},
		
		// Remove one or many states. If state is null, all
    // states for the event wil be removed.
		unbind: function(event, cb){
			if(event in this._events === false)	return;
			this._events[event].splice(this._events[event].indexOf(cb), 1);
			if(!cb) delete this._events[event];
		},
		
		// Trigger an event, firing all bound states. Callbacks are passed the
    // same arguments as 'trigger' is, apart from the event name.
		trigger: function(event){
			if( event in this._events === false  )	return;
			for(var i = 0; i < this._events[event].length; i++){
				this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
			}
		}
	
	}

  //  APIs for making requests against FamilySearch's Server. 
	//	All request types take the same arguments; url, parameters and a state.
  //	

	FamilySearch.Request = {
		
		states : {},
		
		// Standard JSONP request
		//
		// 		FamilySearch.Request.jsonp(url[, paramerters, state])
		//
		jsonp:function(url,params,cb) {
			var 
				self 	= this,
				script 	= document.createElement('script'),
				uuid	= FamilySearch.uuid(),
				params 	= FamilySearch.Util.extend((params||{}),{state:'FamilySearch.Request.states.' + uuid}),
				url 	= url + (url.indexOf('?')>-1 ? '&' : '?') + FamilySearch.Util.encodeQueryString(params);
				url = url.replace('?', FamilySearch._api_format+'?');

			this.states[uuid] = function(data) {
				if(data.error) {
					FamilySearch.log([data.error,data.error_description].join(' : '));
				}
				if(cb) cb(data);
				delete self.states[uuid];
			}
			script.src = url;
			document.getElementsByTagName('head')[0].appendChild(script);
		},


		corsjson:function(url,params, cb) {
			var 
				method 	= ("_method" in params ? params._method : "GET"),
				requestHeader = {
					type : "Accept",
					value : "application/json"
				};

			if ("_method" in params) { // Don't keep this for our post string
				delete params._method;

			}
			if (method == "POST") { // Change the content type to get the appropriate response
				requestHeader = {
					type : "Content-type",
					value : "application/x-www-form-urlencoded"
				};
			}		

			var xhr = new XMLHttpRequest();
			if ("withCredentials" in xhr) {
				// Check if the XMLHttpRequest object has a "withCredentials" property.
				// "withCredentials" only exists on XMLHTTPRequest2 objects.
				xhr.open(method, url);
				xhr.setRequestHeader(requestHeader.type, requestHeader.value);
				xhr.send(FamilySearch.Util.encodeQueryString(params));

			} else if (typeof XDomainRequest != "undefined") {
				// Otherwise, check if XDomainRequest.
				// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
				xhr = new XDomainRequest();
				xhr.open(method, url);
				xhr.setRequestHeader(requestHeader.type, requestHeader.value);
				xhr.send(FamilySearch.Util.encodeQueryString(params));
			} else {
				// Otherwise, CORS is not supported by the browser.
				xhr = null;
			}

			xhr.onreadystatechange = function() {
				if (this.status == 200 && this.readyState == 4) {
					if (this.responseText != "") {
						var data = FamilySearch.Util.parseJSON(this.responseText);
						for (var attrname in data) { params[attrname] = data[attrname]; }
						cb(params);
						//delete FamilySearch.states[params.state];	 // Not needed?
					}
  				}
			};
			xhr.onerror = function() {
				FamilySearch.log('CORS request failed for URL: '+url);
				FamilySearch.log(params);
			};
		},		

		cors:function(url,params,cb,method) {
			var 
				self 	= this,
				method 	= ("_method" in params ? params._method : "GET"),
				requestHeader = new Array("Accept","application/json"),
				script 	= document.createElement('script'),
				uuid	= FamilySearch.uuid(),
				params 	= FamilySearch.Util.extend((params||{}),{state:'FamilySearch.Request.states.' + uuid}),
				url 	= url + (url.indexOf('?')>-1 ? '&' : '?') + FamilySearch.Util.encodeQueryString(params);
				url = url.replace('?', FamilySearch._api_format+'?');
			console.log(params);
			if ("_method" in params) { // Don't keep this for our post string
				delete params._method;
			}
			if (method == "POST") { // Change the content type to get the appropriate response
				requestHeader = new Array("Content-type","application/x-www-form-urlencoded");
			}

			this.states[uuid] = function(data) {
				if(data.error) {
					FamilySearch.log([data.error,data.error_description].join(' : '));
				}
				if(cb) cb(data);
				delete self.states[uuid];
			}			

			var xhr = new XMLHttpRequest();
			if ("withCredentials" in xhr) {
				// Check if the XMLHttpRequest object has a "withCredentials" property.
				// "withCredentials" only exists on XMLHTTPRequest2 objects.
				xhr.open(method, url);
				xhr.setRequestHeader(requestHeader);
				xhr.send(FamilySearch.Util.encodeQueryString(params));
			} else if (typeof XDomainRequest != "undefined") {
				// Otherwise, check if XDomainRequest.
				// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
				xhr = new XDomainRequest();
				xhr.open(method, url);
				xhr.setRequestHeader(requestHeader);
				xhr.send(FamilySearch.Util.encodeQueryString(params));
			} else {
				// Otherwise, CORS is not supported by the browser.
				xhr = null;
			}
			xhr.onreadystatechange = function() {
				if (this.status == 200 && this.readyState == 4) {
    				var data = FamilySearch.Util.parseJSON(this.responseText);
					return data;
  				}
			};
			xhr.onerror = function() {
				FamilySearch.log('CORS request failed.');
				FamilySearch.log(url);
				FamilySearch.log(params);
			};


			var xhr = new XMLHttpRequest();
			if ("withCredentials" in xhr) {
				// Check if the XMLHttpRequest object has a "withCredentials" property.
				// "withCredentials" only exists on XMLHTTPRequest2 objects.
				xhr.open(method, url, false);
				xhr.setRequestHeader("Accept","application/json");
				xhr.send("grant_type=authorization_code&code="+code+'&client_id='+FamilySearch._appid);
			} else if (typeof XDomainRequest != "undefined") {
				// Otherwise, check if XDomainRequest.
				// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
				xhr = new XDomainRequest();
				xhr.open(method, url);
				xhr.setRequestHeader("Accept","application/json");
				xhr.send("grant_type=authorization_code&code="+code+'&client_id='+FamilySearch._appid);
			} else {
				// Otherwise, CORS is not supported by the browser.
				xhr = null;
			}
			var data = xhr.responseText;
			console.log(data);
			return data;
		},
		
  	// Same as a jsonp request but with an access token for oauth authentication
  	//
		// 		FamilySearch.Request.oauth(url[, paramerters, state])
		//
		oauth:function(url,params,cb) {
			params || (params = {});
			if(FamilySearch._access_token) {
				FamilySearch.Util.extend(params,{access_token:FamilySearch._access_token});
			} else {
				FamilySearch.log('FamilySearch.Request.oauth() called without an access token.');
			}
			this.jsonp(url,params,cb);
		},
		


  	// Opens a popup window with the given url and places it at the
   	// center of the current window. Used for app authentication. Should only 
   	// be called on a user event like a click as many browsers block popups 
   	// if not initiated by a user. 
  	//
		// 		FamilySearch.Request.popup(url[, paramerters, state])
		//
		popup: function(url,params,cb) {
			this.registerXDHandler();
			// figure out where the center is
			var
				screenX    	= typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
				screenY    	= typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
				outerWidth 	= typeof window.outerWidth != 'undefined' ? window.outerWidth : document.documentElement.clientWidth,
				outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.documentElement.clientHeight - 22),
				width    		= params.width 	|| 780,
				height   		= params.height || 500,
				left     		= parseInt(screenX + ((outerWidth - width) / 2), 10),
				top      		= parseInt(screenY + ((outerHeight - height) / 2.5), 10),
				features = (
					'width=' + width +
					',height=' + height +
					',left=' + left +
					',top=' + top
				);
			var 
				uuid		= FamilySearch.uuid(),
				params 	= FamilySearch.Util.extend((params||{}),{
					state	: uuid,
					display		: 'popup',
					origin		: this._origin()
				}),
				url 		= url + (url.indexOf('?')>-1 ? '&' : '?') + FamilySearch.Util.encodeQueryString(params);
			var win = window.open(url,uuid,features);

			this.states[uuid] = function(data) {
				if(cb) cb(data,win);
				delete FamilySearch.Request.states[uuid];
			}
		},

  	// Creates and inserts a hidden iframe with the given url then removes 
  	// the iframe from the DOM
  	//
		// 		FamilySearch.Request.hidden(url[, paramerters, state])
		//
		hidden:function(url,params,cb) {
			this.registerXDHandler();
			var 
				iframe 	= document.createElement('iframe'),
				uuid		= FamilySearch.uuid(),
				params 	= FamilySearch.Util.extend((params||{}),{
					state	: uuid,
					display		: 'hidden',
					origin		: this._origin()
				}),
				url 		= url + (url.indexOf('?')>-1 ? '&' : '?') + FamilySearch.Util.encodeQueryString(params);
				
			iframe.style.display = "none";
			this.states[uuid] = function(data) {
				if(cb) cb(data);
				delete FamilySearch.Request.states[uuid];
				iframe.parentNode.removeChild(iframe);
			}
			iframe.src = url;
			document.getElementsByTagName('body')[0].appendChild(iframe);
		},
		
		
		// Make sure we're listening to the onMessage event
		registerXDHandler:function() {
			if(this.xd_registered) return;
			var 
				self=FamilySearch.Request,
				fn = function(e){FamilySearch.Request.onMessage(e)}
			window.addEventListener
				? window.addEventListener('message', fn, false)
				: window.attachEvent('onmessage', fn);
			this.xd_registered = true;
		},
	
		// handles message events sent via postMessage, and fires the appropriate state
		onMessage:function(e) {
			var data = {};
			if (e.data && typeof e.data == 'string') {
				data = FamilySearch.Util.decodeQueryString(e.data);
			}
			
			if(data.error) {
				FamilySearch.log(data.error,data.error_description);
			}
			
			if(data.state) {
				var cb = this.states[data.state];
				if(cb) {
					if (data.code != "") {
						FamilySearch.Auth.getToken(data.code, data, cb);
					} else {
						cb(data);
						delete this.states[data.state];	
					}
				}
			}
		},
		
		// get the origin of the page
		_origin: function() {
			return (window.location.protocol + '//' + window.location.host)
		}
		


	}
	
	// Authentication

	FamilySearch.Auth = {
		
		// Returns the current authentication status of the user from the server, and provides
		// an access token if the user is logged into FamilySearch and has authorized the app.
		//
		// 		FamilySearch.Auth.getStatus(function(response){
		//			if(response.status == 'authorized') {
		//				// User is logged in and has authorized the app
		//			}
		//		})
		//
		// The status returned in the response will be either 'authorized', user is logged in
		// and has authorized the app, 'unauthorized', user is logged in but has not authorized 
		// the app and 'unknown', user is not logged in.
		
		getStatus:function(cb) {
			if(!FamilySearch._appid) {
				return FamilySearch.log('FamilySearch.Auth.getStatus() called without an app id');
			}
			var url = FamilySearch._host[FamilySearch._environment]  + FamilySearch._url.status;
			FamilySearch.Request.hidden(url,{client_id:FamilySearch._appid},function(data){
				FamilySearch.Auth.setStatus(data);
				if(cb) cb(data);
			});
		},
		
		// Launches the authorization window to connect to FamilySearch and if successful returns an
		// access token.
		//
		// 		FamilySearch.Auth.connect(function(response){
		//			if(response.status == 'authorized') {
		//				// User is logged in and has authorized the app
		//			}
		//		})
		//
		
		connect:function(cb) {
			if(!FamilySearch._appid) {
				return FamilySearch.log('FamilySearch.Auth.connect() called without an app id.');
			}
			if(!FamilySearch._access_token) {
				// Get the base host URL for callback. 
				// No args or hashtags please.
				var host = document.URL,
					parts = null;
				if (host.indexOf('#') > 0) {
					parts = host.split('#');
					host = parts[0];	
				}
				if (host.indexOf('?') > 0) {
					parts = host.split('?');
					host = parts[0];	
				}
				if ( FamilySearch._auth_callback.indexOf(host) <= 0 ) {
					host = host.slice(0,-1) + FamilySearch._auth_callback; // Put the host URL if not present
				} else {
					host = FamilySearch._auth_callback;
				}
				var url = FamilySearch._oauth[FamilySearch._environment] + FamilySearch._url.connect,
					params = {
						response_type	: 'code',
						client_id		: FamilySearch._appid,
						redirect_uri	: host
						//lng				:  // Language code
					};
				FamilySearch.Request.popup(url,params,function(data,win){
					FamilySearch.Auth.setStatus(data);
					if(win) win.close();
					if(cb) cb(data);
				});
			} else {
				FamilySearch.log('FamilySearch.Auth.connect() called when user is already connected.');
				if(cb) cb();
			}
		},
		
		// Revokes your apps authorization access
		//
		// 		FamilySearch.Auth.disconnect(function(){
		//			// App authorization has been revoked
		//		})
		//
		disconnect:function(cb) {
			if(!FamilySearch._appid) {
				return FamilySearch.log('FamilySearch.Auth.disconnect() called without an app id.');
			}
			var url = FamilySearch._host[FamilySearch._environment]  + FamilySearch._url.disconnect;
			FamilySearch.Request.jsonp(url,{client_id:FamilySearch._appid},function(r){
				FamilySearch.Auth.setStatus(null);
				if(cb) cb(r);
			})
		},
		
		
		// Logs the user out of FamilySearch
		//
		// 		FamilySearch.Auth.logout(function(){
		//			// App authorization has been revoked
		//		})
		//
		logout:function(cb) {
			if(!FamilySearch._appid) {
				return FamilySearch.log('FamilySearch.Auth.logout called() without an app id.');
			}
			var url = FamilySearch._host[FamilySearch._environment]  + FamilySearch._url.logout;
			FamilySearch.Request.jsonp(url,{client_id:FamilySearch._appid},function(r){
				FamilySearch.Auth.setStatus(null);
				if(cb) cb(r);
			});
		},
		
		// Determines the correct status ('unknown', 'unauthorized' or 'authorized') and 
		// sets the access token if authorization is approved.
		setStatus:function(data) {
			data || (data = {});
			
			if(data.access_token) {
				FamilySearch._access_token = data.access_token;
				FamilySearch.Cookie('familysearch'+FamilySearch._appid, FamilySearch._access_token);
				data.status = "authorized";
			} else {
				if(data.code) {
					FamilySearch._code = data.code;
					console.log('set the code!');
				}
				FamilySearch._access_token = null;
				FamilySearch.Cookie('familysearch'+FamilySearch._appid, null);
				data.status = data.status || "unknown";
			}
			if(FamilySearch._status != data.status) {
				FamilySearch.Event.trigger('auth:statusChange',data.status);
			}
			return (FamilySearch._status = data.status);
		},
		getToken:function(code, data, cb) {
			var url = FamilySearch._oauth[FamilySearch._environment]  + FamilySearch._url.token,
				params 	= FamilySearch.Util.extend((params||{}),{
					_method		: "POST",
					grant_type	: "authorization_code",
					code		: code,
					client_id	: FamilySearch._appid,
					state 		: data.state
				});
			FamilySearch.Request.corsjson(url, params, cb);
		},
		setToken:function(code) {
			var url = FamilySearch._oauth[FamilySearch._environment]  + FamilySearch._url.token,
				params 	= FamilySearch.Util.extend((params||{}),{
					_method		: "POST",
					grant_type	: "authorization_code",
					code		: code,
					client_id	: FamilySearch._appid
				});
				console.log(code);
				console.log('Now get the token!');
				return;
			var data = FamilySearch.Util.parseJSON(FamilySearch.Request.corsjson(url, params));
			console.log(data);
			if (data.access_token != "") {
				return data.access_token;
			}
			return code;
		}		
	}
	
	
	
	// Make API calls to FamilySearch's Servers
	//
	// The API strives to provide consistent access to FamilySearchâ€™s data. IDs are embedded before 
	// the action so the urls read more like a sentence. To get all profile 1â€™s tree matches 
	// you would request 
	//
	//			FamilySearch.api('/profile-1/tree-matches',function(data){
	//				// returns a list of tree matches for profile with id 1
	//			}) 
	//
	// Omitting the ids in urls implies the action should be applied to the current userâ€™s data. 
	// For example, 
	//
	//			FamilySearch.api('/profile',function(data) {
	//				// returns current user's profile data
	//			})
	//
	// will return the profile information for the logged in user. Parameters can optionally be 
	// passed in as the second argument:
	//
	//			FamilySearch.api('/profile-101',{fields:'first_name,last_name'},function(data) {
	//				// only returns first and last name of profile with id 101
	//			})
  // 
  // Visit htp://dev.familysearch.com for more detailed documentation.
  //
	FamilySearch.Api = {
	
		// Makes an oauth jsonp request to FamilySearch's servers for data.
		//
		// 		FamilySearch.Api.get('/user',function(data){
		//			// do something awesome with FamilySearch data
		//		})
		//
		get:function(path,params,cb) {
			if(typeof params == 'function') {
				cb = params;
				params = {};
			}	
			params || (params = {});
			if(params.method) {
				params['_method'] = params.method;
				delete params.method;
			}
    		path = FamilySearch._host[FamilySearch._environment]  + FamilySearch._url.api + "/" + path.replace(/^\//,'');
    
	    	FamilySearch.Request.oauth(path, params, cb);
		},
		
		
		// Makes an oauth jsonp request to FamilySearch's servers to save data. All jsonp
		// requests use a GET method but we can get around this by adding a 
		// _method=post parameter to our request.
		//
		// 		FamilySearch.Api.post(function(data){
		//			// Add awesome data to FamilySearch
		//		})
		//
		post:function(path,params,cb) {
			params = FamilySearch.Util.extend({'_method':'post'},params || {});
			this.get(path,params,cb);
		}
		
	}
	
	// Cookies
	// Helper function to get/set browser cookies so an application's server can have access
	// to the access token.
	//
	FamilySearch.Cookie = function (key, value, options) {
		if(!FamilySearch._cookies) return;
    if (arguments.length > 1 && String(value) !== "[object Object]") {
			options = FamilySearch.Util.extend({}, options);
			if (value === null || value === undefined) options.expires = -1;
			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}
			value = String(value);
			return (document.cookie = [
				encodeURIComponent(key), '=',
				options.raw 		? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '',
				options.path 		? '; path=' + options.path : '',
				options.domain 	? '; domain=' + options.domain : '',
				options.secure 	? '; secure' : ''
			].join(''));
    }
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
	}
	
	// shortcuts to make things easier

	window.FamilySearch = window.$g = FamilySearch.Util.extend(FamilySearch,{
		getStatus		: FamilySearch.Auth.getStatus,
		connect			: FamilySearch.Auth.connect,
		disconnect	: FamilySearch.Auth.disconnect,
		logout			: FamilySearch.Auth.logout,
		api					: FamilySearch.Api.get 					//most api calls are gets
	});

}).call(this);


