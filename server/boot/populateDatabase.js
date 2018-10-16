'use strict';
var colors = require('colors');

// define all of our custom roles with this boot script
// boot scripts run every time you start the server
module.exports = function(app) 
{
    // add roles you want to create to this list
    var roles = ['employee', 'customer'];

    // add people you want to create to this list
    var everyone = {
        employee: customer('employee', 'employee'),
        cust1: customer('customer1', 'customer'),
        cust2: customer('customer2', 'customer')
    }
    // add all items you want to create to this list
    var inventory = {
        indica: item('indica'),
        sativa: item('sativa'),
        hybrid: item('hybrid')
    }
    // add order history to a customer with every item on the list
    var orders = {
        order1: order(everyone.cust1)
    }

    // comment this out to stop boot script from running
    createRoles();

    // comment this out to keep role creation, but disable data population (customers, items, etc)
    function populateData()
    {   
        // this adds customers, items and orders to the database
        createEverything();
    }


    /******************************* FUNCTIONS *******************************/


    
    // returns customer object with specified name/role
    function customer(name, role)
    {           
        return {
            "username": name,
            "password": name,
            "role": role
        }
    }

    // returns item object with specified name/type
    function item(name)
    {   
        return {
            "name": name,
            "type": name,
            "price": 4
        }
    }

    // returns order object with specified customer
    function order(cust)
    {
        return {
            "customer": cust
        }
    }

    // create them roles in the database
    function createRoles()
    {
        for (var i = 0; i < roles.length; i++)
        {
            // create role. use i to reference the role name   
            createRole(i);
        }
    }

    // define employee role
    function createRole(roleNum)
    {
        // check if the employee role exists already
        app.models.Role.findOne({where: {name: roles[roleNum]}}, function(err, role)
        {
            // if its the first thing, just console log to initiate the boot script display
            if (roleNum == 0)
            {
                console.log("\n\nRunning Boot Script 'populateDatabase':\n\n".blue);
                console.log("Boot Script: ".blue + "Creating Roles:\n".cyan);
            }
            // mongo/searching error
            if (err)
            {
                console.log(("Boot Script: Error while searching db for role " + roles[roleNum]).red);
                return;
            }
            // role has already been created    
            if (role)
            {
                // create customer role
                console.log("Boot Script: ".blue + ("Role already created: " + roles[roleNum]).cyan);
                roleCreated();
                return;
            }

            // role has not been created, so create it
            console.log("Boot Script: ".blue + ("Role not yet created: " + roles[roleNum]).cyan);
            console.log("Boot Script: ".blue + ("Creating Role: " + roles[roleNum]).cyan);
            // create employee role
            app.models.Role.create({name: roles[roleNum]}, function(error)
            {
                // mongo/write erorr
                if (error)
                {
                    console.log(("Boot Script: Error while writing role to db " + roles[roleNum]).red);
                    return;
                }

                // successfully created employee role, now create customer role
                console.log("Boot Script: ".blue + ("Successfully created Role: " + roles[roleNum]).cyan);
                roleCreated();
            });
        });
    }

    // when we create customers we need to make sure all roles are created
    // roleCreated counts all roles then initiates customer creation
    var roleCount = 0;
    function roleCreated()
    {
        // increments everytime role is created
        roleCount++;
        // wait until it reaches the total size
        if (roleCount == roles.length)
        {
            console.log("Boot Script: ".blue + ("All Roles created: " + roles.length + " roles total").cyan);
            // create customers, items, orders, etc
            populateData();
        }
    }

    // this function start a chain of functions that populates the database with people, items, orders
    function createEverything()
    {
        console.log('\nBoot Script: '.blue + "Creating Customers:".yellow);
        console.log('Boot Script: '.blue + "Creating Items:\n".magenta);

        // populate people into database
        Object.keys(everyone).forEach(function(person) 
        {
            createPerson(everyone[person]);
        });

        // create items in database
        Object.keys(inventory).forEach(function(inv)
        {
            createItem(inventory[inv]);
        });
    }

    // adds a person to the database
    function createPerson(person)
    {
        // check if this person exists already
        app.models.Customer.findOne({where: {username: person.username}}, function(error, req)
        {
            // mongo/search error
            if (error)
            {
                console.log(("Boot Script: Error while searching db for customer " + person.username).red);
                return;
            }
            // person already exists
            if (req)
            {
                console.log("Boot Script: ".blue + ("Customer already created " + person.username).yellow);
                person.id = req.id;
                person.fresh = false;
                objCreated(1, 0);
                return;
            }

            // person doesnt exist, so create it
            console.log("Boot Script: ".blue + ("Customer not yet created: " + person.username).yellow);
            console.log("Boot Script: ".blue + ("Creating Customer: " + person.username).yellow);
            app.models.Customer.create(person, function(err, res)
            {
                // mongo/write error
                if (err)
                {
                    console.log(("Boot Script: Error while writing customer to db " + person.username).red);
                    return;
                }

                // successfully created person in database
                console.log("Boot Script: ".blue + ("Successfully created Customer: " + person.username).yellow);
                person.id = res.id;
                person.fresh = true;
                roleMap(person);
            });
        });
    }

    // creates role mapping between user and role
    function roleMap(person)
    {
        console.log("Boot Script: ".blue + ("Mapping Role: " + person.role + ", to Customer: " + person.username).yellow);
        // find the role in mongo based on the passed parameter while creating a person
        app.models.Role.findOne({where: {name: person.role}}, function(err, role)
        {
            // mongo search error or null results
            if (err)
            {
                console.log(("Boot Script: Error while searching db for role to roleMap to customer " + person.role).red);
                return;
            }
            if (!role)
            {
                console.log(("Boot Script: Error while trying to roleMap, cannot find role " + person.role).red);
                return;
            }

            // role was found. now create a RoleMap object with the roleId and personId
            role.principals.create({principalType: app.models.RoleMapping.USER, principalId: person.id}, function(error)
            {
                // mongo write error
                if (error)
                {
                    console.log(("Boot Script: Error while creating roleMap to customer " + person.role).red);
                    return;
                }
    
                // successfully mapped role
                console.log("Boot Script: ".blue + ("Successfully mapped Role: " + person.role + ", to Customer: " + person.username).yellow);
                objCreated(1, 0);
                return;
            });
        });
    }

    // adds an item to the database
    function createItem(inv)
    {
        // check if this person exists already
        app.models.Item.findOne({where: {name: inv.name}}, function(error, req)
        {
            // mongo/search error
            if (error)
            {
                console.log(("Boot Script: Error while searching db for item " + inv.name).red);
                return;
            }
            // item already exists
            if (req)
            {
                console.log("Boot Script: ".blue + ("Item already created " + inv.name).magenta);
                inv.id = req.id;
                objCreated(0, 1);
                return;
            }

            // item doesnt exist, so create it
            console.log("Boot Script: ".blue + ("Item not yet created: " + inv.name).magenta);
            console.log("Boot Script: ".blue + ("Creating Item: " + inv.name).magenta);
            app.models.Item.create(inv, function(err, res)
            {
                // mongo/write error
                if (err)
                {
                    console.log(("Boot Script: Error while writing item to db " + inv.name).red);
                    return;
                }

                // item successfully added to database
                console.log("Boot Script: ".blue + ("Successfully created Item: " + inv.name).magenta);
                inv.id = res.id;
                objCreated(0, 1);
                return;
            });
        });
    }

    // when we create orders we need to make sure all customers/items are created
    // objCreated counts all customers/items then initiates order creation
    var custCount = 0;
    var itemCount = 0;
    var orderCount = 0;
    function objCreated(cust, inv)
    {
        // increments everytime something is created
        custCount += cust;
        itemCount += inv;
        
        // display message when all customers are created
        if (custCount == Object.keys(everyone).length && cust == 1)
        {
            console.log("Boot Script: ".blue + ("All Customers created: " + Object.keys(everyone).length + " customers total").yellow);
        }
        // display message when all items are created
        if (itemCount == Object.keys(inventory).length && inv == 1)
        {
            console.log("Boot Script: ".blue + ("All Items created: " + Object.keys(inventory).length + " items total").magenta);
        }

        // wait until it reaches the total size
        if (custCount + itemCount == Object.keys(everyone).length + Object.keys(inventory).length)
        {
            console.log("\nBoot Script: ".blue + "Creating Orders:".white);
            // create items in database
            Object.keys(orders).forEach(function(ord)
            {   
                // check if order "already exists" in db
                if (orders[ord].customer.fresh)
                {
                    orderCount++;
                    createOrder(orders[ord].customer);
                }
            });
            orderCreated(0);
        }
    }

    // adds an order to the database (order has every item on it)
    function createOrder(cust)
    {
        // check if "order exists"
        console.log("Boot Script: ".blue + ("Creating order for customer " + cust.username).white);
        app.models.Order.create({customerId: cust.id}, function(err, res)
        {
            // mongo/write error
            if (err)
            {
                console.log(("Boot Script: Error while writing to db for order " + inv.name).red);
                return;
            }

            res.paid = true;
            // order successfully created, add relation to items
            console.log("Boot Script: ".blue + ("Successfully created order for customer " + cust.username).white);
            // cycle through items and add it to order
            console.log("Boot Script: ".blue + ("Adding all items to order for customer " + cust.username).white);
            Object.keys(inventory).forEach(function(inv)
            {
                addItemToOrder(res, inventory[inv]);
            });
            orderCreated(1);
        });
    }

    // add the relationship between order and item
    function addItemToOrder(ord, inv)
    {
        ord.items.add(inv.id, function(err)
        {
            // mongo/write error
            if (err)
            {
                console.log('Error in boot script creating a relationship between order and item');
                return;
            }
        });
    }

    // keep track of orders and display a message when the script is finished
    var ordCount = 0;
    function orderCreated(count)
    {
        ordCount += count;

        if (ordCount == orderCount)
        {
            console.log("Boot Script: ".blue + ("All Orders created: " + orderCount + " orders total").white);
            console.log("\n\nFinished Boot Script 'populateDatabase':".blue);
        }
    }
}
