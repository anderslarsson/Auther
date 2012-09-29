var should = require('should'), 
	assert = require('assert'), 
	auther = require('../lib/auther');
	
describe('Auther test suite', function() {

	describe('hasAccess (internal)', function() {
		it('should return true if id is in parameter list', function() {
			auther.hasAccess({ cid: 34 }, { session: { user: { AOHash: { cid : [1,2,34,40] }}}}).should.eql(true)
		})
		it('should return false if id is not in parameter list', function() {
			auther.hasAccess({ cid: 34 }, { session: { user: { AOHash: { cid : [1,2,40] }}}}).should.eql(false)
		})
	})
	
	
	
})