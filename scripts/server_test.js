var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var http = require('http');
var fs = require('fs');

var url = 'mongodb://localhost:27017/test';

var server =require('./main');


var getAllTestLocations = function (db, callback){
	var all_test_locations=db.collection('locations').find(
		{"name":"SERVERTEST"}
	);
	all_test_locations.toArray(function(err,docs){
		assert.equal(err,null);
		if (callback!=null){
			callback(db,docs);
		}
	});
}

var removeTestLocations =function(db){
	var removed=db.collection('locations').remove(
		{"name":"SERVERTEST"},
		function(err,results){
			db.close();
	});
}

var writeTest=function(db){
	server.updateLocation(db,10,15,"SERVERTEST", function(db){
		getAllTestLocations(db,function(db,docs){
			console.log(docs[0]);
			assert.equal(docs.length,1);
			assert.equal(docs[0].lat,10);
			assert.equal(docs[0].lon,15);
			removeTestLocations(db);
		});
	});
}

MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	console.log("Connected correctly to server.");
	writeTest(db);

});