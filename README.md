# sms24x7-client

A simple util/module that allows to send text messages via sms24x7.ru SMS service. 

It contains library and cmd util. 


## INSTALLATION
```sh
npm install -g sms24x7-client
```


## USAGE
```sh
sms24x7-client --email=your-account-email@example.com --password=your-account-password --phone=receiver-phone --message=your-text-message [--sender=sender-name-string]
```


## USAGE IN CODE
```javascript
var SmsSender, smsSender, Minimist, cmdArgs; 


SmsSender = require('sms24x7-client'); 
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

```
Available options while creating SmsSender instance: 

```javascript
var smsSender = new SmsSender({
	defaultSender: 'your-sender-name',
	connection:    {
		host:              'api.sms24x7.ru',  // API host, default is api.sms24x7.ru
		forceHttps:        false,             // Use HTTPS connection (default is true)
		defaultHttpMethod: 'GET',             // HTTP method (work with GET and POST only)
		forceFullResponse: true,              // Is response object full or simplified
		apiVersion:        '1.1',             // API version, default is 1.1
		dataType:          'JSON',            // Data format, JSON is preferred
		phonesAsJson:      true               // Send phone list as JSON (true is preferred)
	},
	auth: {
		email:    null,                       // Your sms24x7.ru account email
		password: null                        // Your sms24x7.ru account password
	}
});
```

This repo is open for pull requests and contributions. 
