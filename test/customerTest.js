var supertest = require('supertest');
var app = require('../server/server');
var api = supertest(app);

// COMMON RESPONSE CODES:
var ok = 200;
var noContent = 204;
var unauthorized = 401;

// FUNCTION TO CREATE A NEW AND UNIQUE CUSTOMER
function Customer()
{
	return {   
    	"username": "customer" + Date.now(),
    	"password": "test"
	}
}

// FUNCTION TO CREATE A NEW AND UNIQUE
function Order()
{
	return {
		"name": "test"
	}
}

// ADMIN
var admin = {"username":"admin", "password":"admin"};
var customer = Customer();


describe('/Customers Tests:', function() 
{
    it('01: POST /Customers             	Create a new customer', function(done)
    {
        api.post('/api/Customers')
            .send(customer)
            .expect(ok, done);
    });

    it('02: POST /Customers/login       	Login a customer', function(done)
    {
        api.post('/api/Customers/login')
            .send(customer)
            .expect(ok)
            .end( function(err, res)
            {
                if (err) { return done(err); }

                customer.id = res.body.id;
                customer.userId = res.body.userId;

				// NOW LOGIN AN ADMIN ACCOUNT FOR FUTURE TEST PURPOSES
                api.post('/api/Customers/login')
        			.send(admin)
        			.end(function(err, res)
        			{
            			if (err)
            			{
                		return err;
            			}

            			admin.id = res.body.id;
            			admin.userId = res.body.userId;
						done();
        			});
            });
    });

    it('03: GET  /Customers/{id}        	A customer can get their own info', function(done)
    {
        api.get('/api/Customers/' + customer.userId)
            .set({ Authorization: customer.id })
            .expect(ok, done);
    });

	it('04: GET  /Customers/{id}        	A customer cannot get someone elses info', function(done)
    {
        api.get('/api/Customers/' + admin.userId)
            .set({ Authorization: customer.id })
            .expect(unauthorized, done);
    });

	it('05: GET  /Customers             	A customer cannot get someone elses info', function(done)
    {
        api.get('/api/Customers')
            .set({ Authorization: customer.id })
            .expect(unauthorized, done);
    });

    it('06: POST /Customers/{id}/orders 	A customer can create an order on their own account', function(done)
    {
        api.post('/api/Customers/' + customer.userId + '/orders')
            .set({ Authorization: customer.id })
			.send(Order())
            .expect(ok, done);
    });

	it('07: POST /Customers/{id}/orders 	A customer cannot create an order on someone elses account', function(done)
    {
        api.post('/api/Customers/' + admin.userId + '/orders')
            .set({ Authorization: customer.id })
            .send(Order())
            .expect(unauthorized, done);
    });

	it('08: GET  /Customers/{id}/orders     A customer can get their own orders', function(done)
    {
        api.get('/api/Customers/' + customer.userId + '/orders')
            .set({ Authorization: customer.id })
            .expect(ok, done);
    });

	it('09: GET  /Customers/{id}/orders     A customer cannot get someone elses orders', function(done)
    {
        api.get('/api/Customers/' + admin.userId + '/orders')
            .set({ Authorization: customer.id })
            .expect(unauthorized, done);
    });

	it('10: POST /Customers/logout     		A customer can logout', function(done)
    {
        api.post('/api/Customers/logout')
            .set({ Authorization: customer.id })
            .expect(noContent, done);
    });	
});
