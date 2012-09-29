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
		}	
	})

## Authentication



## Authorization	


	
## View helpers

In jade view the following helper functions are available. They are provided by the auther#helpers middleware. 

- isLoggedIn()
- username()

### Todo

- role()


	

