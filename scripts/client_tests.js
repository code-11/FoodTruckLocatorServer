function flower_box(){
	console.log("--------------");
	console.log("Ran All Client Tests");
}

// Can we make a get request to the client, ie is it up?
function client_ping_test(request,assert,callback){
	console.log("Running Ping Test")
	request('https://foodinatorclient.herokuapp.com', {}, function(err, res, body) {
		assert.equal(err,null);
		console.log("	Got body: ", body);
		callback();
	});
}

function run_all_client_tests(request,assert){

	console.log("Running Client Tests:");
	console.log("--------------");
	client_ping_test(request,assert,flower_box);
}

module.exports={
	run_all_client_tests: run_all_client_tests
};