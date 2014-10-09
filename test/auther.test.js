var should = require('should');
var assert = require('assert'); 
var auther = require('../lib/auther');
	
describe('Auther test suite', function() {

	var resources = [1,2,3,4,5,6,7,8,9];
	var user;

	before(function(done) {
		console.log('before');

		var rolesToResourcesHash = {
			myrole: function(user, done) {
				var roleToResources = {}
				roleToResources['id'] = resources;
				done(null, roleToResources);
			}
		}

		user = { role: 'myrole'};
		auther.initUser(user, rolesToResourcesHash, function(err) {
			done();
		});

	})
	
	describe('isAuthorized', function() {
		it('should return function', function() {
			assert.equal(typeof auther.isAuthorized(), 'function')
		})
		
		it('should call next on valid resource', function () {
			var req = { params: { id: 3 }, user: user};
			var res = { 
				send: function(msg, code) {
				} 
			};			
			var next = function(err) {
				should.not.exist(err);
			}

			auther.isAuthorized('myrole')(req, res, next);
		});

		it('should call res.send 403 on invalid resource', function () {
			var req = { params: { id: 30 }, user: user};
			var res = { 
				send: function(msg, code) {
					code.should.equal(403);
				} 
			};			
			var next = function(err) {
				should.not.exist();
			}

			auther.isAuthorized('myrole')(req, res, next);
		});
	});
	
});