var assert = require('assert');
// var jquery = require('jquery');

// Can we make a get request to the server, ie is it up?
function ping_test(){
		options={
		url:"https://foodinator.herokuapp.com/",
		method: "GET"
	};

	req = http.request(options, function(res) {
		res.on('data', function (chunk) {
			console.log('Received data: ' + chunk);
		});
		res.on('end', function() {
			console.log('Finished request sucessfully');
		});
	});
	req.on('error', function(e) {
		//There was some sort of error, throw the error and fail the test
		throw e.message;
	});
	req.end();
}

console.log("Running Tests:");
console.log("--------------");
ping_test();
console.log("--------------");
console.log("Ran All Tests");
