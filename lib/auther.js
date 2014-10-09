var _ 		= require('lodash');
var async 	= require('async');

/**
 * Setup user based on role. 
 *
 * roleToResourceFuncs is a hash mapping each role to a async function, which returns err and a array of resource ids. 
 */
var initUser = exports.initUser = function(user, roleToResourcesFuncs, cb) {

	user.authorizedTo = user.authorizedTo || {};
	
	if (user.role === 'sys') {
		return cb(null, user);
	}	

	roleToResourcesFuncs[user.role](user, function(err, resources) {
		if (err) return next(err);

		user.authorizedTo = resources;

		cb(null, user);
	});
}

/**
 * Check if user is authorize to use a resource.
 *
 */
var hasAccess = function(resourceIds, req) {
	if (!req.user) {
		return false;
	}
	for (var r in resourceIds) {
		var id = resourceIds[r];
		if (req.user.authorizedTo[r]) {
			if (!req.user.authorizedTo[r].some(function(r) { return r == id})) {
				return false;
			}		
		}
	}
	return true;
}

exports.hasAccess = hasAccess;

/**
* Per route middleware. Checking access to route and to its resources.
*
* @param roles array or just N arguments with roles.
* @return returns a function which redirects to /session/new, sends a 403 or calls next middleware.
*/
exports.isAuthorized = function(roles) {	
	if (roles != undefined && !Array.isArray(roles)) {
		var tempRoles = []
		for (var i = 0; i < arguments.length; i++) {
			tempRoles.push(arguments[i])
		}
		roles = tempRoles
	}
	
	return function(req, res, next) {	
	 	// if no user not logged in
		if (!req.user) {
			return res.send(401);
		}
		// sys sees everything, no authorizedTo is needed to be checked
		if (req.user.role === 'sys') {
			return next();
		}
		if (roles.indexOf(req.user.role) == -1) {
			return res.send('You are not authorized to access this resource', 403);
		}
		if (hasAccess(req.params, req)) {
			return next();
		} else {
			// initUser(req.user, function(err) {
			// 	if (err) return next(err);
				
			// 	if (hasAccess(req.params, req)) {
			// 		return next();
			// 	} else {
					return res.send('You are not authorized to access this resource', 403);					
				// }
			// });
		}
	}
}