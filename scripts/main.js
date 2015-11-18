var GoogleAuth = require('google-auth-library');
var MongoClient = require('mongodb');//.MongoClient;
var assert = require('assert');
var http = require('http');
var fs = require('fs');


var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test';

var DB=null;

var getId=function(){
	var rnd_num=Math.round(Math.random()*10);
	return rnd_num;
}

var authenticate=function(db,token,callback){
	options={
		url:"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token="+token,
		method: "POST"
	};

	req = http.request(options, function(res) {
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
		res.on('end', function() {
			console.log('No more data in response.')
		});
	});
	req.on('error', function(e) {
  		console.log('problem with request: ' + e.message);
	});
	req.end();
}


var updateLocation=function(db,lat,lon,usertoken,istruck,callback){
	// authenticate(db,usertoken,null);
	//TODO: ADD TO HISTORICAL LOCATION COLLECTION
	var dbtag="";
	if (istruck){
		dbtag="trucks";
	}else{
		dbtag="users";
	}
	db.collection(dbtag).update( 
		{"name":usertoken},	
		{ 
			$set: {
				"name" : usertoken,
				"lastpos" : {
					"lat": parseFloat(lat),
					"lon": parseFloat(lon),
					"timestamp" : new Date().getTime() / 1000 | 0
				}
			}
		},
		{upsert:true},
	 function(err, result) {
	    assert.equal(err, null);
	    console.log("Updated "+usertoken+" in the "+dbtag+" collection.");
	    if (callback!=null){
	    	callback(db);
		}
	    //findDocuments(db);
	    // db.close();
  	});
}

var delete_as=function (db,callback){
	db.collection("trucks").remove({});
}

var getAllLocations = function (db, callback){
	var all_locations=db.collection('trucks').find();
	all_locations.toArray(function(err,docs){
		assert.equal(err,null);
		console.log(docs);
		callback(db,docs);
	});
}

var findDocuments = function(db,callback) {
	var cursor =db.collection('locations').find(
		{"name":"xxx"}
	);
	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc != null) {
			console.log("Found Document");

			if (callback!=null){
				callback(db,doc);
			}
		}
	});
};

function registerTruck(db,req,res,callback){
	console.log("In register Truck");
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var parsed=JSON.parse(body);
        console.log(parsed);
		db.collection("trucks").update( 
				{"name":parsed.username},	
				{ 	
					"name":parsed.username,
					"pinfo":{
						"fname":parsed.fname,
						"lname":parsed.lname,
						"email":parsed.email,
						"phone":parsed.phone
					},
					"tinfo":{
						"tname":parsed.truckname,
						"city":parsed.city,
						"tags":parsed.tags,
						"msg":parsed.blurb,
						"pic":parsed.truckpic
					}
				},
				{upsert:true},
			 function(err, result) {
			    assert.equal(err, null);
			    console.log("Updated "+parsed.username+" in the trucks collection.");
			    if (callback!=null){
			    	callback(db);
				}
		  	});
    });
}

function innerWorkings(db,req,res){
	console.log("In inner Workings");
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
    	// console.dir(body);

    	// var regex=/lon=([\-0-9\.]*)&lat=([\-0-9\.]*)/
        var parsed=JSON.parse(body);
        console.dir(parsed);
        updateLocation(db,parsed.lat,parsed.lon,parsed.userid, parsed.istruck, function(db){
			console.log("After UpdateLocation");
			getAllLocations(db,function(db,docs){
				res.end(JSON.stringify(docs));
        	});
        	// delete_as(db);
        });
    });
}

function handleRequest(req, res){
	if (req.method == 'POST') {
		console.log("Got a POST");
		// console.log(req);
		db=DB;
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Content-Type","json");
		console.log(req.url);
		if (req.url=="/register"){
			registerTruck(db,req,res,function(){
				res.end("Works");
			});
		}else{
			innerWorkings(db,req,res);
		}
	}
	else if (req.method == 'GET') {
	    res.end('It Works!! Path Hit: ' + req.url);
	}
	else{
		console.log("Got a something else:"+req.method);
	}
}

module.exports={
	updateLocation: updateLocation,
	findDocuments: findDocuments
};

MongoClient.connect(url,{}, function(err, db) {
	DB=db;
	assert.equal(null, err);
	console.log("Connected correctly to server.");

	const PORT=process.env.PORT || 8080; 

		//Create a server
	var server = http.createServer(handleRequest);

	//Lets start our server
	server.listen(PORT, function(){
	    //Callback triggered when server is successfully listening. Hurray!
	    console.log("Server listening on: http://localhost:%s", PORT);

	});

});