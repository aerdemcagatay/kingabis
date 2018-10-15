var supertest = require('supertest');
var app = require('../server/server');
var api = supertest(app);

// COMMON RESPONSE CODES:
var ok = 200;
var noContent = 204;
var unauthorized = 401;

// FUNCTION TO CREATE A NEW AND UNIQUE CUSTOMER
function Customer(role)
{
	return {   
    	"username": "customer" + Date.now(),
    	"password": "test",
        "role": role
	}
}

// Create default users: employee, customer, and guest
var employee;
var customer;
var guest;

var order = {};

var item = {
    "name": "dank",
    "type": "sativa",
    "price": 4.20
};


describe('Customer Tests:', function() 
{
    it('01: POST   /Customers             	Create a new employee', function(done)
    {
        employee = Customer('employee');
        api.post('/api/Customers')
            .send(employee)
            .expect(ok, done);
    });

    it('02: POST   /Customers               Create a new customer', function(done)
    {
        customer = Customer('customer');
        api.post('/api/Customers')
            .send(customer)
            .expect(ok, done);
    });

    it('03: POST   /Customers/login       	Login an employee', function(done)
    {
        api.post('/api/Customers/login')
            .send(employee)
            .expect(ok)
            .end( function(err, res)
            {
                if (err) { return done(err); }

                employee.accessToken = res.body.id;
                employee.userId = res.body.userId;

				done();
            });
    });

    it('04: POST   /Customers/login         Login a customer', function(done)
    {
        api.post('/api/Customers/login')
            .send(customer)
            .expect(ok)
            .end( function(err, res)
            {
                if (err) { return done(err); }

                customer.accessToken = res.body.id;
                customer.userId = res.body.userId;

                done();
            });
    });

    it('05: POST   /Customers/login         Login a guest', function(done)
    {
        guest = Customer('customer');
        guest.username = 'guest';
        api.post('/api/Customers/login')
            .send(guest)
            .expect(ok)
            .end( function(err, res)
            {
                if (err) { return done(err); }

                guest.accessToken = res.body.id;
                guest.userId = res.body.userId;

                done();
            });
    });

    it('06: GET    /Customers/{id}          A customer can get their own info', function(done)
    {
        api.get('/api/Customers/' + customer.userId)
            .set({ Authorization: customer.accessToken })
            .expect(ok, done);
    });

	it('07: GET    /Customers/{id}        	A customer cannot get someone elses info', function(done)
    {
        api.get('/api/Customers/' + guest.userId)
            .set({ Authorization: customer.accessToken })
            .expect(unauthorized)
            .end(done);
    });

    it('08: GET    /Customers/{id}            An employee can get anyone elses info', function(done)
    {
        api.get('/api/Customers/' + customer.userId)
            .set({ Authorization: employee.accessToken })
            .expect(ok, done);
    });

    it('09: GET    /Customers/                A customer cannot get everyones info', function(done)
    {
        api.get('/api/Customers')
            .set({ Authorization: customer.accessToken })
            .expect(unauthorized, done);
    });

    it('10: GET    /Customers/                An employee can get everyones info', function(done)
    {
        api.get('/api/Customers')
            .set({ Authorization: employee.accessToken })
            .expect(ok, done);
    });
});


describe('Item Tests:', function()
{
    it('11: POST /Items                 A customer cannot create items', function(done)
    {   
        api.post('/api/Items')
            .set({ Authorization: customer.accessToken })
            .send(item)
            .expect(unauthorized, done);
    });

    it('12: POST /Items                 An employee can create items', function(done)
    {   
        api.post('/api/Items')
            .set({ Authorization: employee.accessToken })
            .send(item)
            .expect(ok)
            .end( function(err, res)
            {
                if (err) { return done(err); }

                item.id = res.body.id;
                done();
            });
    });

    it('13: GET  /Items                 A customer can get all items', function(done)
    {
        api.get('/api/Items')
            .set({ Authorization: customer.accessToken })
            .send(item)
            .expect(ok, done);
    });

    it('14: GET  /Items                 An employee can get all items', function(done)
    {
        api.get('/api/Items')
            .set({ Authorization: employee.accessToken })
            .send(item)
            .expect(ok, done);
    });

    it('15: GET  /Items/{id}            A customer can get all items', function(done)
    {
        api.get('/api/Items/' + item.id)
            .set({ Authorization: customer.accessToken })
            .send(item)
            .expect(ok, done);
    });
    
    it('16: GET  /Items/{id}            An employee can get all items', function(done)
    {       
        api.get('/api/Items/' + item.id)
            .set({ Authorization: employee.accessToken })
            .send(item)
            .expect(ok, done);
    });
});


describe('Order Tests:', function()
{
    it('17: POST /Customers/{id}/orders     A customer can create an order on their own account', function(done)
    {
        api.post('/api/Customers/' + customer.userId + '/orders')
            .set({ Authorization: customer.accessToken })
            .send({})
            .expect(ok)
            .end( function(err, res)
            {   
                if (err) { return done(err); }

                app.models.Order.find({where: {customerId: customer.userId}}, function(error, ord)
                {
                    if (error) { return done(error); }
    
                    order.id = ord[0].id;
                    done();
                });
            });
    });

    it('18: POST /Customers/{id}/orders     A customer cannot create an order on someone elses account', function(done)
    {
        api.post('/api/Customers/' + employee.userId + '/orders')
            .set({ Authorization: customer.accessToken })
            .send({})
            .expect(unauthorized, done);
    });

    it('19: POST /Customers/{id}/orders     An employee can create an order on someone elses account', function(done)
    {
        api.post('/api/Customers/' + customer.userId + '/orders')
            .set({ Authorization: employee.accessToken })
            .send({})
            .expect(ok, done);
    });

    it('20: GET  /Customers/{id}/orders     A customer can get their own orders', function(done)
    {
        api.get('/api/Customers/' + customer.userId + '/orders')
            .set({ Authorization: customer.accessToken })
            .expect(ok, done);
    });

    it('21: GET  /Customers/{id}/orders     A customer cannot get someone elses orders', function(done)
    {
        api.get('/api/Customers/' + employee.userId + '/orders')
            .set({ Authorization: customer.accessToken })
            .expect(unauthorized, done);
    });

    it('22: POST /Customers/{id}/orders     An employee can get anyones orders', function(done)
    {
        api.post('/api/Customers/' + customer.userId + '/orders')
            .set({ Authorization: employee.accessToken })
            .send({})
            .expect(ok, done);
    });

    it('23: PUT  /Orders/{id}/items/rel/{fk}     A customer can add an item to their own order', function(done)
    {
        api.put('/api/Orders/' + order.id + '/items/rel/' + item.id)
            .set({ Authorization: customer.accessToken })
            .send({})
            .expect(ok, done);
    });

    it('24: PUT  /Orders/{id}/items/rel/{fk}     A customer cannot add an item to someone elses order', function(done)
    {
        api.put('/api/Orders/' + order.id + '/items/rel/' + item.id)
            .set({ Authorization: guest.accessToken })
            .send({})
            .expect(unauthorized, done);
    });

    it('25: PUT  /Orders/{id}/items/rel/{fk}     A employee can add an item to someone elses order', function(done)
    {
        api.put('/api/Orders/' + order.id + '/items/rel/' + item.id)
            .set({ Authorization: employee.accessToken })
            .send({})
            .expect(ok, done);
    });
});


describe('Order Tests:', function()
{
    it('26: DELETE /Customers/{id}            A customer can delete themselves', function(done)
    {
        api.delete('/api/Customers/' + customer.userId)
            .set({ Authorization: customer.accessToken })
            .expect(ok, done);
    });

    it('27: DELETE /Customers/{id}            A customer cannot delete someone else', function(done)
    {
        api.delete('/api/Customers/' + employee.userId)
            .set({ Authorization: guest.accessToken })
            .expect(unauthorized, done);
    });

    it('28: POST   /Customers/logout          A customer can logout', function(done)
    {
        api.post('/api/Customers/logout')
            .set({ Authorization: guest.accessToken })
            .expect(noContent, done);
    });

    it('29: DELETE /Customers/{id}            An employee can delete anyone', function(done)
    {   
        api.delete('/api/Customers/' + guest.userId)
            .set({ Authorization: employee.accessToken })
            .expect(ok, done);
    });

    it('30: POST   /Customers/logout          A employee can logout', function(done)
    {
        api.post('/api/Customers/logout')
            .set({ Authorization: employee.accessToken })
            .expect(noContent, done);
    });
});
