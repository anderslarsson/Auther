/**
 * Checks if user has access to a specific resource
 *
 * @param resourceIds Hash with all :resource ids
 * @param req Request object
*/
var hasAccess = function(resourceIds, req) {
	for (var r in resourceIds) {
		var id = resourceIds[r];
		if (req.session.user.AOHash[r]) {
			if (!req.session.user.AOHash[r].some(function(r) { return r == id})) {
				return false;
			}		
		}
	}
	return true;
}

exports.hasAccess = hasAccess

/**
* Auther options
*
*/
var options = {}

/**
* Init auther and sets up session routes
*
* @param app express application
* @param opts options
*/
exports.init = function(app, opts) {
	options = opts;
	options.loginView = options.loginView || 'login';
	options.afterLogoutRoute = options.afterLogoutRoute || '/'
	
	app.get('/session/new', exports.sessionNew)
	app.get('/session/destroy', exports.sessionDestroy)
	app.post('/session', exports.sessionCreate)
	
	if (options.indexRoute) {
		app.get(options.indexRoute.route, exports.isAuthorized(), exports.indexRoute);
	}
}

/**
* Two view helpers:
* - is the user in a specific role - inRole
* - has the user access to a specific resoruce - hasAO
*
*/
exports.helpers = function(req, res, next) {
	res.locals.inRole = function(id) {
		return req.session.user.role == id;
	}
	res.locals.hasAO = function(accessId, id) {
		if (!req.session.user.AOHash[accessId]) {
			return false;
		}
		if (req.session.user.AOHash[accessId].indexOf(id) == -1) {
			return false;
		}		
		return true;
	}
	res.locals.isLoggedIn = function() {
		return req.session.user != undefined;
	}
	res.locals.username = function() {
		return req.session.user.username;
	}
	next();
}

/**
* Show login view
*
*/
exports.sessionNew = function(req, res, next) {
	res.render(options.loginView, { title: 'login' })
}

/**
* Do the actual authentication and setup authorization
*
*/
exports.sessionCreate = function(req, res, next) {
	options.authenticate(req.body.username, req.body.password, function(err, isAuthenticated, user) {
		if (err) return next(err);
		
		if (isAuthenticated) {
			user.username = req.body.username;
			user.AOHash = {}
			req.session.user = user;
			req.session.user.isSuperUser = user.isSuperUser || false;
			options['load_' + user.role](user, function(err) {
				// Make sure all AOHash ids are strings.
				
				if (req.body.redir) {
					res.redirect(req.body.redir)
				} else {					
					res.redirect(req.session.redir);
				}
			})
		} else {
			// TODO: Add flash message
			res.redirect('/session/new')
		}
	})
}

/**
* Do logout and redirect to afterLogoutRoute
*
*/
exports.sessionDestroy = function(req, res, next) {
	req.session.destroy();
	res.redirect(options.afterLogoutRoute)	
}

/**
* Route index depending on role. Checks for :param and substitues with first in AOHash[:param] array.
*
*/
exports.indexRoute = function(req, res, next) {
	var route = options.indexRoute[req.session.user.role];
	var params = route.match(/\:\w+/g) || [];
	params.forEach(function(match) {
		route = route.replace(match, req.session.user.AOHash[match.substring(1)][0]);
	});
	res.redirect(route);
}

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
		if (roles == undefined) {
			if (!req.session.user) {
				req.session.redir = req.url;
				return res.redirect('/session/new')
			}
			return next()
		}
		if (!req.session.user) {
			req.session.redir = req.url;
			return res.redirect('/session/new')
		}
		if (req.session.user.isSuperUser) {
			return next();
		}
		if (roles.indexOf(req.session.user.role) == -1) {
			return res.send('You are not authorized to access this resource', 403);
		}
		if (hasAccess(req.params, req)) {
			return next();
		} else {
			req.session.user.AOHash = {}
			options['load_' + req.session.user.role](req.session.user, function(err) {
				if (err) return next(err);
				
				if (hasAccess(req.params, req)) {
					return next();
				} else {
					return res.send('You are not authorized to access this resource', 403);					
				}
			})
		}
	}
}