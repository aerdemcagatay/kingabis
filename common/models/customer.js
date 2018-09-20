'use strict';

module.exports = function(Customer) 
{
	/*
	Customer.beforeCreate = function(next, modelInstance) 
	{
		const MongoClient = require('mongodb').MongoClient;

		const uri = "mongodb+srv://admin:admin@cluster0-keoik.gcp.mongodb.net/test?retryWrites=true";
		MongoClient.connect(uri, function(err, client)
		{
			if(err)
			{
				console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
		        }

		    	console.log('Connected...');
			const collection = client.db("test").collection("Messages");
			
			collection.insertOne({a:5}, {w:1});
				
			client.close();
			next();
		});
	};
	*/
};
