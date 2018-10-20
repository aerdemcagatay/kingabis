'use strict';
var app = require('../../server/server');

module.exports = function(Order) 
{
    // authenticate users before adding items to an order
    Order.beforeRemote('*.__link__items', function(ctx, link, next)
    {
        checkAuth(ctx.res.req.accessToken.userId, ctx.instance.id, next);
    });
    // authenticate users before removing an item from an order
    Order.beforeRemote('*.__unlink__items', function(ctx, link, next)
    {
        checkAuth(ctx.res.req.accessToken.userId, ctx.instance.id, next);
    });
    // authenticate users before removing an item from an order
    Order.beforeRemote('*.__get__items', function(ctx, link, next)
    {
        checkAuth(ctx.res.req.accessToken.userId, ctx.instance.id, next);
    });
    // authenticate users before checkout
    Order.beforeRemote('checkout', function(ctx, link, next)
    {
        checkAuth(ctx.res.req.accessToken.userId, ctx.args.id, next);
    });


    // custom function to check roles/ownership and authenticate
    function checkAuth(userId, orderId, next)
    {
        // find the customer based on who is making the call
        app.models.Customer.findById(userId, function(err, customer)
        {   
            // check for errors/null results
            if (err || !customer)
            {
                console.log("Order authentication error while finding customer " + userId);
                next(err);
                return;
            }
            // if employee, automatically allow access
            if (customer.role == 'employee')
            {
                next();
                return;
            }

            // now find the order based on the id passed
            Order.findById(orderId, function(error, order)
            {
                // check for errors and null finds
                if (error || !order)
                {   
                    console.log("Order authentication error while finding order " + orderId);
                    next(error);
                    return;
                }

                // if the order owner is not the person accessing, deny access
                if (!order.customerId.equals(customer.id))
                {
                    console.log("Customer does not own this order! " + userId + " / " + orderId);
                    var authErr = new Error();
                    authErr.statusCode = 401;
                    authErr.message = "Authorization Required";
                    next(authErr);
                    return;
                }
                
                // access granted
                next();
            });
        });
    }

    Order.checkout = function(order, next) 
    {
        next();
    }

    Order.remoteMethod('checkout', 
    {
        accepts: [
            {arg: 'id', type: 'string', required: true}
        ],
        http: 
        {
            path: '/:id/checkout',
            verb: 'post'
        }
  	});
};
