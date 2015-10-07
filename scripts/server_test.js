var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var http = require('http');
var fs = require('fs');

var url = 'mongodb://localhost:27017/test';


var server =require('./main');

var writeTest=function(db){
	server.updateLocation(db,10,15, function(db){
		server.findDocuments(db,function(db,doc){
			console.log(doc.lat==10 && doc.lon==15 ? true : false);
		});
	});
}

MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	console.log("Connected correctly to server.");
	writeTest(db);

});