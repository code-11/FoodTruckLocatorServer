function flower_box(callback){
	console.log("--------------");
	console.log("Ran All Server Tests");
	callback();
}

// Can we make a get request to the server, ie is it up?
function server_ping_test(request,assert,callback){
	console.log("Running Ping Test");
	request('https://foodinator.herokuapp.com/', {}, function(err, res, body) {
		assert.equal(err,null);
		console.log("	Got body: ", body);
		callback();
	});
}

//Can we get a post request to the server, ie has someone screwed up the main routes?
function get_trucks_test(request,assert,callback){
	console.log("Running Get Trucks Test");
	request('https://foodinator.herokuapp.com/showtrucks', {}, function(err, res, body) {
		assert.equal(err,null);
		console.log("	Got body: ", body);
		callback();
	});
}

function contains_test_truck(body){
	saw_test_truck=false;
	for (var i=0;i<body.length;i+=1){
		if (body[i]["name"]=="?SERVERTEST"){
			saw_test_truck=true;
			break;
		}
	}
	return saw_test_truck;
}

// /deletetest
//Do a fake register against the server and check to see it added correctly.
//Then delete the fake truck and make sure it deleted correctly.
function add_truck_test(request,assert,callback){
	console.log("Running Add Truck Test");

	var to_send={
		truckname: "SERVERTEST",
		tags: "SERVERTEST",
		blurb: "SERVERTEST",
		truckpic: "SERVERTEST",
		city: "SERVERTEST",
		fname: "SERVERTEST",
		lname: "SERVERTEST",
		email: "SERVERTEST",
		phone: "SERVERTEST",
		username: "?SERVERTEST"
	}

	request.post({
			url:'https://foodinator.herokuapp.com/register',
			body: JSON.stringify(to_send)
	}, function(err, res, body) {
		assert.equal(err,null);
		request('https://foodinator.herokuapp.com/showtrucks', {}, function(err, res, body) {
			assert.equal(err,null);
			assert.equal(contains_test_truck(JSON.parse(body)),true);
			console.log("Found Test Truck");
			request('https://foodinator.herokuapp.com/deletetest', {}, function(err, res, body) {
				
				assert.equal(err,null);
				console.log("Deleting Test Truck");
				request('https://foodinator.herokuapp.com/showtrucks', {}, function(err, res, body) {
					
					assert.equal(err,null);
					assert.equal(contains_test_truck(JSON.parse(body)),false);
					console.log("Successfully Deleted Test Truck");
					callback();
				});
			});
		});
	});
}

function run_all_server_tests(request,assert,callback){

	console.log("Running Server Tests:");
	console.log("--------------");
	server_ping_test(request,assert,function(){
		get_trucks_test(request,assert,function(){
			add_truck_test(request,assert,function(){
				flower_box(callback);
			});
		});
	});
} 

module.exports={
	run_all_server_tests: run_all_server_tests
};

