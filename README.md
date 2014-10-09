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


## Authorization	

For each role in your application, implament a load_XXX function. First argument is the user object created in the
authentication phase. Populate the user.AOHash for each of the resource types.

