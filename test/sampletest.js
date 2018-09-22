var supertest = require('supertest');
var app = require('../server/server');
var api = supertest(app);

describe('/Customers', function() 
{
    // COMMON RESPONSE CODES:
    var ok = 200;
    var unauthorized = 401;
   
    
    it('Get customers', function(done) 
    {
        api.get('/api/Customers')
            .send()
            .expect(ok)
            .end( function(err, res)
            {
                if (err)
                {
                  return done(err);
                }

                done();
            });
    });
});
