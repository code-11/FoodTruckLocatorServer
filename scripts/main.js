var GoogleAuth = require('google-auth-library');
var MongoClient = require('mongodb');//.MongoClient;
var assert = require('assert');
var http = require('http');
var fs = require('fs');


var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test';

var DB=null;

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
	//TODO: HAVE SERVER ACTUALL DO OAUTH RIGHT
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
	    console.log("Updated "+usertoken+" in the "+dbtag+" collection updateLoc");
	    if (callback!=null){
	    	callback(db);
		}
  	});
}

var delete_as=function (db,callback){
	db.collection("trucks").remove({});
}

var delete_reporting=function(db,callback){
	db.collection("reporting").remove({});
}
var delete_users=function(db,callback){
	db.collection("users").remove({});
}

var delete_test=function(db,callback){
	console.log("removing test truck");
	db.collection("trucks").remove({"name":"?SERVERTEST"}, function(err,result){
		assert.equal(err, null);
	    console.log(result);
	});
}

var getAllLocations = function (db, callback){
	var all_locations=db.collection('trucks').find();
	all_locations.toArray(function(err,docs){
		assert.equal(err,null);
		callback(db,docs);
	});
}

var getAllReporting = function(db,callback){
	var all_reporting=db.collection("reporting").find();
	all_reporting.toArray(function(err,docs){
		assert.equal(err,null);
		callback(db,docs);
	});
}
var getAllUsers = function(db,callback){
	var all_users=db.collection("users").find();
	all_users.toArray(function(err,docs){
		assert.equal(err,null);
		callback(db,docs);
	});
}

var getManyTrucks=function(db,truckids,callback){
	console.log("GET MANY TRUCKS");
	console.log(truckids);
	var all_matching_trucks=db.collection("trucks").find(
		{"name":{$in:truckids}}
	);
	all_matching_trucks.toArray(function(err,docs){
		assert.equal(err,null);
		callback(db,docs);
	});
}

//Returns a javascript array of unqiue truck ids representing the favorites for a user into docs of the callback function
var getFavoritesForUser = function(db,req,res,callback){
	var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
    	var parsed=JSON.parse(body);
		var favorites=db.collection("users").find(
			{"name": parsed.userid},
			{"favorites":1}
		);
		favorites.toArray(function(err,docs){
			console.log("GET FAVORITES");
			console.log(docs);
			//If we got favorites correctly
			if (docs[0].favorites){
				if (callback!=null){
					callback(db,docs[0].favorites);
				}
			//otherwise return empty array	
			}else{
				callback(db,[]);
			}
		});
	});	
}

var setFavorite =function(db,req,res,callback){
	var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var parsed=JSON.parse(body);
		db.collection("users").update( 
			{"name":parsed.userid},	
			{ 
				 $addToSet: { favorites: parsed.truckid } 
			},
			function(err, result) {
			assert.equal(err, null);
			if (callback!=null){
				callback(db);
			}
		});
	});
}
var unsetFavorite =function(db,req,res,callback){
	var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var parsed=JSON.parse(body);
		db.collection("users").update( 
			{"name":parsed.userid},	
			{ 
				 $pull: { favorites: parsed.truckid } 
			},
			function(err, result) {
			assert.equal(err, null);
			if (callback!=null){
				callback(db);
			}
		});
	});
}

function report(db,req,res,callback){
	var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var parsed=JSON.parse(body);
		db.collection("reporting").insert( 
			parsed,
			function(err, result) {
			    assert.equal(err, null);
			    console.log("Added report");
			    if (callback!=null){
			    	callback(db);
				}
		  	});
    });
}

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
						"tags":parsed.tags,
						"msg":parsed.blurb,
						"pic":parsed.truckpic
					}
				},
				{upsert:true},
			 function(err, result) {
			    assert.equal(err, null);
			    console.log("Updated "+parsed.username+" in the trucks collection: register");
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
        console.dir("Got stuff from client: "+parsed);
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
	res.setHeader("Access-Control-Allow-Origin", "*");
	db=DB;
	if (req.method == 'POST') {
		console.log("Got a POST");
		// console.log(req);
		res.setHeader("Content-Type","json");
		console.log(req.url);
		if (req.url=="/register"){
			registerTruck(db,req,res,function(){
				res.setHeader("Access-Control-Allow-Origin", "*");
				res.end("{}");
			});
		}else if(req.url=="/report"){
			report(db,req,res,function(){
				res.setHeader("Access-Control-Allow-Origin", "*");
				res.end("{}");
			});
		}else if(req.url=="/favorite"){
			setFavorite(db,req,res,function(){
				res.setHeader("Access-Control-Allow-Origin", "*");
				res.end("{}");
			});
		}else if (req.url=="/unfavorite"){
			unsetFavorite(db,req,res,function(){
				res.end("{}");
			});
		}else if(req.url=="/showfavorites"){
			getFavoritesForUser(db,req,res,function(db,favs){
				getManyTrucks(db,favs,function(db,docs){
					res.end(JSON.stringify(docs));
				});
			});
		}else{
			innerWorkings(db,req,res);
		}
	}
	else if (req.method == 'GET') {
		console.log("Got a GET");
		if(req.url=="/deletetrucks"){
			delete_as(db,function(){});
			res.end("deleted trucks");
		}else if (req.url=="/deletetest"){
			console.log("got a deletetruck");
			delete_test(db,function(){});
			res.end("deleted test truck");
		}else if (req.url=="/showtrucks"){
			getAllLocations(db,function(db,docs){
				res.setHeader("Content-Type","json");
				res.end(JSON.stringify(docs));
        	});
		}else if (req.url=="/showreports"){
			getAllReporting(db,function(db,docs){
				res.setHeader("Content-Type","json");
				res.end(JSON.stringify(docs));
        	});
		}else if (req.url=="/showusers"){
			getAllUsers(db,function(db,docs){
				res.setHeader("Content-Type","json");
				res.end(JSON.stringify(docs));
			});
		}else if (req.url=="/deleteusers"){
			delete_users(db,function(){});
			res.end("deleted users");
		}else if (req.url=="/deletereports"){
			delete_reporting(db,function(){});
			res.end("deleted reporting");
		}else{
	    	res.end('It Works!! Path Hit: ' + req.url);
	    }
	}
	else{
		console.log("Got a something else:"+req.method);
	}
}

module.exports={
	updateLocation: updateLocation
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