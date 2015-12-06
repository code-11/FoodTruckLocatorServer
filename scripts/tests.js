var request = require('request');
var assert = require('assert');

var server_tests = require('./server_tests');
// var client_tests = require('./client_tests');

server_tests.run_all_server_tests();
