#!/usr/bin/env nodejs



'use strict';




var SmsSender, smsSender, Minimist, cmdArgs, command, printHelp;




SmsSender = require('../lib');
Minimist  = require('minimist');




cmdArgs   = Minimist(process.argv.slice(2));
command   = cmdArgs._[0]


printHelp = function(showUnsupportedCommand) {
	var lines = [];

	if (showUnsupportedCommand) {
		lines = lines.concat([
			'',
			'    Unsupported command',
		]);
	}

	lines = lines.concat([
		'',
  		'    Usage:',
  		'        sms24x7-client send|help --email=email --password=password --phone=recipient_phone --message=message_text [--sender=alias]',
  		'',
  		'    Available commands:',
      	'        send    Send text message to a recipient',
      	'                    --email       Account email',
      	'                    --password    Account password',
      	'                    --phone       Recipient phone number',
      	'                    --message     Message text',
      	'                    --sender      Text string to show instead of server phone number',
      	'',
      	'        help    Show this help and exit',
      	''
	]);

    console.log(lines.join('\n'));
}




smsSender = new SmsSender({
	connection: {
		forceHttps: true
	},
	auth: {
		email:    cmdArgs.email,
		password: cmdArgs.password
	}
});


switch (command) {
	case 'send':
		smsSender
			.send(cmdArgs.phone, cmdArgs.message, cmdArgs.sender)
			.then(function(response) {
				console.log(JSON.stringify(response));
			})
			.catch(function(error) {
				console.log(JSON.stringify(response));
			});
		break;

	case 'help':
		printHelp(false);
		break;

	default:
		printHelp(command);
}
