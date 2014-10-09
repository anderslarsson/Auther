[![Build Status](https://secure.travis-ci.org/anderslarsson/Auther.png)](http://travis-ci.org/anderslarsson/Auther)


# Auther

Simple Authorization middleware for express.js. 

Validates access to resources based on express route parameters.


## installation

	npm install auther


## usage

	var auther = require('auther');


	...

	app.get('/company/:cid', auther.isAuthorized('admin', 'managers'), companyRoutes.get)	
	...


		
	// With passport.js
	var setupFacebook = function() {
		...

		autheur.initUser(user, rolesToResourcesHash, function(err) {

		...
	}



	var rolesToResourcesHash = {
		admin: function(user, cb) {
			var roleToResources = {}

			roleToResources['cid'] = [companyId];

			done(null, roleToResources);
		}, 
		...
	}


## New objects strategy

Normally the user is stored in session together with all allowed resources. What if a new resource is created after the user was logged in? 
If Auther fails to grant access to a resource, it will redo the initialization and all allowed resources, including new ones, will be loaded and 
a new check is done. If that second check fails a 403 is returned. 	



