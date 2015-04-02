#!/usr/bin/env nodejs



'use strict'; 




var SmsSender, smsSender, Minimist, cmdArgs; 




SmsSender = require('../lib'); 
Minimist  = require('minimist'); 




cmdArgs = Minimist(process.argv.slice(2));




smsSender = new SmsSender({
	connection: {
		forceHttps: true
	},
	auth: {
		email:    cmdArgs.email,
		password: cmdArgs.password
	}
}); 
smsSender
	.send(cmdArgs.phone, cmdArgs.message, cmdArgs.sender)
	.then(function(response) {
		console.log(response); 
	})
	.catch(function(error) {
		console.log(error);
	}); 
