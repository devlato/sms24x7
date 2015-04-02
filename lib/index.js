

'use strict';




var _, Q, Request;




_       = require('lodash');
Q       = require('q');
Request = require('request-promise');




module.exports = (function() {

	function SmsSender(options) {
		return this.init(options);
	}


	SmsSender.prototype.init = function(options) {
		this
			._setDefaultOptions()
			._setOptions(options);

		return this;
	};


	SmsSender.prototype.send = function(phone, message, sender) {
		var options    = this.getOptions(),
			deferred   = Q.defer(),
			phones     = _.isArray(phone)
							? phone
							: [phone],
			jsonPhones = JSON.stringify(phones);

		sender = sender || options.defaultSender;

		if (!message) {
			deferred.reject({
				status: 'error',
				error: {
					type:    'sms.errors.send.noMessage',
					details: 'No message to send'
				}
			});
		}

		if (!phone) {
			deferred.reject({
				status: 'error',
				error: {
					type:    'sms.errors.send.noPhoneNumber',
					details: 'No phone number to send to'
				}
			});
		}

		try {
			this._callRemoteMethod('push_msg', {
				sender_name: sender,
				phones:      options.connection.phonesAsJson ? jsonPhones : phones,
				text:        message
			}).then(function(response) {
				if (response && response.body) {
					deferred.resolve({
						status: 'ok',
						response: JSON.parse(response.body)
					});
				} else {
					deferred.reject({
						status: 'error',
						error: {
							type:    'sms.errors.noResponse',
							details: 'Response is empty or malformed'
						}
					});
				}
			});
		} catch (e) {
			deferred.reject({
				status: 'error',
				error: e
			});
		}

		return deferred.promise;
	};


	SmsSender.prototype.getOptions = function() {
		return this._options;
	};


	SmsSender.prototype._callRemoteMethod = function(method, params, httpMethod) {
		var options = this.getOptions(),
		    requestOptions;

		if (!options.auth) {
			throw {
				type:    'sms.errors.send.auth.notSet',
				details: 'No auth data provided, please set up email and password.'
			};
		}

		if (!options.auth.email) {
			throw {
				type:    'sms.errors.send.auth.noEmail',
				details: 'Email is not set, please set up auth options first.'
			};
		}

		if (!options.auth.password) {
			throw {
				type:    'sms.errors.send.auth.noPassword',
				details: 'Password is not set, please set up auth options first.'
			};
		}

		params = _.merge(params, {
			method:   method,
			email:    options.auth.email,
			password: options.auth.password
		});

		requestOptions = this._getRequestOptions(params);

		return Request(requestOptions);
	};


	SmsSender.prototype._getRequestOptions = function(params, httpMethod) {
		var options = this.getOptions(),
		    apiUrl  = this._getApiBaseUrl(),
		    requestOptions,
		    fullResponse,
		    fullUrl,
		    apiVersion,
		    dataType;

		httpMethod   = (httpMethod || options.connection.defaultHttpMethod).toUpperCase();
		fullResponse = options.connection.forceFullResponse;
		apiVersion   = options.connection.apiVersion;
		dataType     = options.connection.dataType;

		params = _.merge(params || {}, {
			api_v:  apiVersion,
			format: dataType
		});

		requestOptions = {
			method:                  httpMethod,
			resolveWithFullResponse: fullResponse
		};

		switch (httpMethod.toUpperCase()) {
			case 'GET':
				fullUrl = [
					apiUrl,
					this._getQuery(params)
				].join('?');
				requestOptions.uri = fullUrl;
				break;

			case 'POST':
				requestOptions.uri  = apiUrl;
				requestOptions.form = params;
				break;

			default:
				throw {
					'type':    'sms.errors.callRemoteMethod.unsupportedHttpMethod',
					'details': 'Sorry, only GET and POST requests are currently supported'
				};
		}

		return requestOptions;
	};


	SmsSender.prototype._getApiBaseUrl = function() {
		var protocol = this._getApiProtocol(),
			host     = this._getApiHost();

		return [
			protocol,
			'://',
			host,
			'/'
		].join('');
	};


	SmsSender.prototype._getQuery = function(params, prefix) {
		var self = this,
			newPrefix;

		return _
				.reduce(params, function(memo, value, key) {
					var queryPart;

					if (_.isArray(value) || _.isPlainObject(value)) {
						if (prefix) {
							newPrefix = [
								prefix,
								'[',
								(key && !_.isNumber(key)) ? key : '',
								']'
							].join('');
							queryPart = self._getQuery(value, newPrefix);
						} else {
							queryPart = self._getQuery(value, key);
						}
					} else {
						if (prefix) {
							queryPart = [
								prefix,
								'[',
								(key && !_.isNumber(key)) ? key : '',
								']=',
								encodeURIComponent(value)
							].join('');
						} else {
							queryPart = [
								key,
								encodeURIComponent(value)
							].join('=');
						}
					}

					memo.push(queryPart);

					return memo;
				}, [])
				.join('&');
	};


	SmsSender.prototype._getApiHost = function() {
		var options = this.getOptions();

		return options.connection.host;
	};


	SmsSender.prototype._getApiProtocol = function() {
		var options = this.getOptions();

		return options.connection.forceHttps
				? 'https'
				: 'http';
	};


	SmsSender.prototype._setOptions = function(options) {
		var currentOptions = _.merge(this._getDefaultOptions(), this._options);

		this._options = _.merge(currentOptions, options);

		return this;
	};


	SmsSender.prototype._setDefaultOptions = function() {
		this._defaultOptions = {
			defaultSender: 'devlato.com',
			connection:    {
				host:              'api.sms24x7.ru',
				forceHttps:        false,
				defaultHttpMethod: 'GET',
				forceFullResponse: true,
				apiVersion:        '1.1',
				dataType:          'JSON',
				phonesAsJson:      true
			},
			auth: {
				email:    null,
				password: null
			}
		};

		return this;
	};


	SmsSender.prototype._getDefaultOptions = function() {
		return this._defaultOptions;
	};


	return SmsSender;

})();
