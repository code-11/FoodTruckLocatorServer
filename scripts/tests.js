var request = require('request');
var assert = require('assert');
var http = require('http');

function flower_box(){
	console.log("--------------");
	console.log("Ran All Tests");
}

// Can we make a get request to the server, ie is it up?
function server_ping_test(callback){
	console.log("Running Ping Test")
	request('https://foodinator.herkuapp.com/', {}, function(err, res, body) {
		assert.equal(err,null);
		console.log("	Got body: ", body);
		callback();
	});
}

console.log("Running Tests:");
console.log("--------------");
ping_test(flower_box);

