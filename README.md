# Auther

Simple (Auth)entification and (Auth)orization middleware for express.js. 

	- Validates access to resources based on id.
	- Uses express route parameters to map to resources.  

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

	

