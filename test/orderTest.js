var supertest = require('supertest');
var app = require('../server/server');
var api = supertest(app);

// COMMON RESPONSE CODES:
var ok = 200;
var noContent = 204;
var unauthorized = 401;


describe('Order Tests:', function()
{
/*
    it('06: POST /Customers/{id}/orders     A customer can create an order on their own account', function(done)
    {
        api.post('/api/Customers/' + customer.userId + '/orders')
            .set({ Authorization: customer.id })
            .send(Order())
            .expect(ok, done);
    });

    it('07: POST /Customers/{id}/orders     A customer cannot create an order on someone elses account', function(done)
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
*/
});
