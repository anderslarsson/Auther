var should = require('should'), 
	assert = require('assert'), 
	auther = require('../lib/auther'), 
	express = require('express'),
	http = require('http'), 
	Browser = require("zombie");
	
describe('Auther test suite', function() {
	var app = express(), 
		browser = new Browser(), 
		base = 'http://localhost:5000', 
		resources = [1,2,3,4,5,6,7,8,9];

	before(function(done) {
		app = express()
		
		app.configure(function(){
			app.set('port', 5000);
			app.set('views', __dirname + '/views');
			app.set('view engine', 'jade');
			app.use(express.bodyParser());
			app.use(express.methodOverride());
			app.use(express.cookieParser('other team'));
			app.use(auther.helpers);
			app.use(express.session());
			app.use(app.router);
		});	
				
		auther.init(app, {
			authenticate: function(username, password, cb) {
				if (username == 'sysadmin') {
					cb(null, true, { role: 'sysadmin', isSuperUser: true })
				} else {					
					cb(null, true, { role: 'myrole', data: 23})
				}
			}, 
			load_myrole: function(user, cb) {
				user.AOHash['id'] = resources
				cb(null)
			}, 
			load_sysadmin: function(user, cb) {
				cb(null)
			}, 
			indexRoute: {
				route: '/app', 
				myrole: '/myrole_start'
			}, 
			afterLogoutRoute: '/afterlogout'
		})	

		app.get('/myresource', auther.isAuthorized('myrole'), function(req, res, next){ res.render('myresource_view', {title:''})})
		app.get('/otherresource/:id', auther.isAuthorized('myrole'), function(req, res, next){ res.render('other_resource_view', {title:''})})
		
		app.get('/afterlogout', function(req, res, next){ res.render('after_logout_view', {title:''})})
		
		http.createServer(app).listen(app.get('port'), function() {
			done()
		});
	})
	
	
	describe('hasAccess (internal)', function() {
		it('should return true if id is in parameter list', function() {
			auther.hasAccess({ cid: 34 }, { session: { user: { AOHash: { cid : [1,2,34,40] }}}}).should.eql(true)
		})
		it('should return false if id is not in parameter list', function() {
			auther.hasAccess({ cid: 34 }, { session: { user: { AOHash: { cid : [1,2,40] }}}}).should.eql(false)
		})
	});
	
	
	describe('isAuthorized', function() {
		it('should return function', function() {
			assert.equal(typeof auther.isAuthorized(), 'function')
		})
		
		it('should redirect to /session/new if not logged in', function(done) {
			var req = { session: { } }
			var res = { redirect: function(url) {
				url.should.eql('/session/new')
				done()
			}}
			auther.isAuthorized()(req, res)
		})
	})
	
	describe('init', function() {	
		it('should setup routes get:/session/new, post:/session, get:/session/destroy, get:/app', function(done) {
			app.routes['get'].length.should.eql(6)
			app.routes['post'][0].path.should.eql('/session')

			done()
		})
	})
	
	describe('When visiting /myresource', function() {
		it('should return login page, fill out, then myresource page should be shown', function(done) {
			browser.visit(base + '/myresource', function(err) {
				browser.success.should.be.ok
				browser.text('h1').should.eql('login')
			  	browser.
			    	fill("username", "anders.larsson@apa.com").
			    	fill("password", "password").
			    	pressButton("login", function() {
						browser.success.should.be.ok
						browser.text('h1').should.eql('myresource')
						done()						
					})
			})
		})
	})
	
	
	describe('When requesting logout /session/destroy', function() {
		it('should redirect to afterLogoutRoute = ', function(done) {
			browser.visit(base + '/session/destroy', function(err) {
				browser.success.should.be.ok
				browser.text('h1').should.eql('afterlogout')
				done()
			})
		})
	})
	
	
	describe('When requesting /otherresource/7', function() {
		it('should show login page, logging in the otherresource view should be shown', function(done) {
			browser.visit(base + '/otherresource/7', function(err) {
				browser.success.should.be.ok
			  	browser.
			    	fill("username", "anders.larsson@apa.com").
			    	fill("password", "password").
			    	pressButton("login", function() {
						browser.success.should.be.ok
						browser.text('h1').should.eql('otherresource')						
						done();
					})
			})
		})
	})
	

	describe('When requesting /otherresurce/340', function() {
		it('should receive 403', function(done) {
			browser.visit(base + '/otherresource/340', function(err) {
				browser.statusCode.should.eql(403)
				done()
			})
		})
	})


	describe('When requesting /otherresurce/340 when its been added to resources', function() {
		it('should receive otherresource view', function(done) {
			resources.push(340);
			browser.visit(base + '/otherresource/340', function(err) {
				browser.success.should.be.ok
				browser.text('h1').should.eql('otherresource')										
				done()
			})
		})
	})
	
	
	describe('When logged in as a superuser', function() {
		it('we should be able to navigate to all resources', function(done) {
			browser.visit(base + '/session/destroy', function(err) {
				browser.success.should.be.ok

				browser.visit(base + '/otherresource/999', function(err) {
					browser.success.should.be.ok	
				  	browser.
				    	fill("username", "sysadmin").
				    	fill("password", "password").
				    	pressButton("login", function() {
							browser.success.should.be.ok
							browser.text('h1').should.eql('otherresource')
							done()						
						})

				})
			})
		})
	})

})