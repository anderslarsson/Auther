[![Build Status](https://secure.travis-ci.org/anderslarsson/Auther.png)](http://travis-ci.org/anderslarsson/Auther)


# Auther

Simple (Auth)entification and (Auth)orization middleware for express.js. 

Validates access to resources based on express route parameters.

Sets up routes for login view (/session/new), authentication (/session/create) and logout (/session/destroy).

After authentication all accessible resources are loaded for user (load_role).


## installation

	npm install auther


## usage

	auther = require('auther')

	...

	app.use(auther.helper)

	...

	app.get('/company/:cid', auther.isAuthorized('admin'), companyRoutes.get)	
	...

	auther.init(app, {
		loginView: 'login', // Default is jade  
		afterLogoutRoute: '/'
		authenticate: function(user, pwd, cb) {
			User.findOne({email: user}, function(err, user) {

				if (!user) return cb(null, false);
			
				cb(null, true, { role: 'admin', company: user.belongsTo })
			})
		}, 
		load_admin: function(user, cb) {
			user.AOHash['cid'] = [user.company];
		
			Employees.find({ company: user.company }, function(err, employees) {
				if (err) return next(err);
			
				user.AOHash['eid'] = employees.map(function(e) {return e._id })
						
				cb(null)
			})
		}, 
		indexRoute: {
			route: '/app', 
			myrole: '/otherresource/:id'
		} 
	
	})

## Authentication



## Authorization	

For each role in your application, implament a load_XXX function. First argument is the user object created in the
authentication phase. Populate the user.AOHash for each of the resource types.

## Index route

The indexRoute parameter gives you the possibility to redirect user to different pages on a single route. That route
is defined in the route attribute. For each role in the application add where to redirect. 

You can also give a parameter in the route, :parameter. The parameter will be looked up in the user.AOHash and the first 
resource will be substituted. 
	
## View helpers

In jade view the following helper functions are available. They are provided by the auther#helpers middleware. 

- isLoggedIn()
- username()

### Todo

- role()
