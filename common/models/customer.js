'use strict';
var app = require('../../server/server');

module.exports = function(Customer) 
{
    // require customer to be either a customer or an employee
    Customer.validatesInclusionOf('role', {in: ['customer', 'employee']});

    // create a customer and configure role mapping
    Customer.afterRemote('create', function(ctx, customer, next)
    {
        roleMap(customer, next);
    });


    // creates role mapping between user and role
    function roleMap(customer, next)
    {
        // find the role in mongo based on the passed parameter while creating a customer
        app.models.Role.findOne({where: {name: customer.role}}, function(err, role)
        {   
            // mongo search error or null results
            if (err || !role)
            {   
                console.log("Create Customer: Error while searching for role '" + customer.role + "'");
                next(err);
                return;
            }
            
            // role was found. now create a RoleMap object with the roleId and customerId
            role.principals.create({principalType: app.models.RoleMapping.USER, principalId: customer.id}, function(error)
            {   
                // mongo write error
                if (error)
                {   
                    console.log("Create Customer: Error creating role map for " + customer.id);
                    next(err);
                    return;
                }
                
                next();
            });
        });
    }


    // this is for special guest login
    Customer.beforeRemote('login', function(ctx, customer, next)
    {
        // only perform this task for guests
        if (ctx.args.credentials.username != 'guest')
        {
            next();
            return;
        }

        // create default guest user. this is so they can easily 'upgrade' to real user if they like the app
        var guest = {
            "username": 'guest' + Date.now(),
            "password": 'guest',
            "role": 'customer'
        };

        // set the login credentials
        ctx.args.credentials.username = guest.username;
        ctx.args.credentials.password = guest.password;

        Customer.create(guest, function(err, cust)
        {
            if (err)
            {
                console.log("Error auto creating guest user");
                next(err);
                return;
            }

            roleMap(cust, next);
        });
    });


    // login, if customer then start an order
    Customer.afterRemote('login', function(ctx, customer, next)
    {
        // get customer info. for some reason cant grab this on the login
        Customer.findById(customer.userId, function(err, cust)
        {
            // mongo search error
            if (err || !cust)
            {
                console.log("Login: Error finding customer by id " + customer.id);
                next(err);
                return;
            }
            // employees dont have orders so return
            if (cust.role == 'employee')
            {
                next();
                return;
            }

            // automatically creates an empty order belong to themselves when customer logging in
            app.models.Order.create({customerId: customer.userId}, function(error)
            {
                // mongo write error
                if (error)
                {
                    console.log("Login: Error auto creating order");
                    next(error);
                    return;
                }

                next();
            });
        });
    });
};
