'use strict';

// define all of our custom roles with this boot script
// boot scripts run every time you start the server
module.exports = function(app) 
{
    var Role = app.models.Role;

    // define employee role
    Role.find({where: {name: 'employee'}}, function(err, role)
    {
        if (err)
        {
            console.log("Boot Script: Error while searching for role 'employee'");
            return;
        }

        // if role has not been created then create it
        if (role.length == 0)
        {
            console.log("Boot Script: Role not yet created 'employee'");
            Role.create({name: 'employee'}, function(error)
            {
                console.log("Boot Script: Creating role 'employee'");
                if (error)
                {
                    console.log("Boot script error while creating role 'employee'!");
                    return;
                }
            });
        }
        else
        {
            console.log("Boot Script: Role already created 'employee'");
        }
    });
   
    // define customer role
    Role.find({where: {name: 'customer'}}, function(err, role)
    {   
        if (err) 
        {   
            console.log("Boot script error while searching for role 'customer'!");
            return;
        }

        // if role has not been created then create it
        if (role.length == 0)
        {
            console.log("Boot Script: Role not yet created 'customer'");
            Role.create({name: 'customer'}, function(error)
            {
                console.log("Boot Script: Creating role 'customer'");
                if (error)
                {
                    console.log("Boot script error while creating role 'customer'!");
                    return;
                }
            });
        }
        else
        {
            console.log("Boot Script: Role already created 'customer'");
        }
    });
}
