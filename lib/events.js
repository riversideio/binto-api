var account = require('google-auth2-service-account'),
	request = require('request'),
	scope = 'https://www.googleapis.com/auth/calendar',
	uriBase = 'https://www.googleapis.com/calendar/v3',
	expires = 360000,
	authed;

function Events ( key, options ) {
	this.key = key;
	this.calId = options.calendarId;
	this.email = options.accountEmail;
}

Events.prototype.auth = function ( callback ) {
	account.auth( this.key, {
		iss : this.email,
		scope : scope,
		expires : expires / 100 // to make it seconds
	}, callback );
};

Events.prototype.fetch = function ( options, callback ) {
	if ( !authed ) {
		return this.auth(function( err, accessToken ){
			if ( err ) return callback( err );
			authed = accessToken;
			this.router( options, callback );
		}.bind( this ))
	}

	this.router( options, callback );
};

Events.prototype.router = function ( options, callback ) {
	options.accessToken = authed;
	if ( options.method === 'get'  ) {
		return this.all( options, callback );
	}
	if ( options.method === 'post' ){
		return this.create( options, callback );
	}
	// should 404
	options.reply('nope');
};

Events.prototype.all = function ( options, callback ) {
	var opts = {
		method : options.method,
		url : uriBase + '/calendars/' + this.calId + '/events',
		qs : options.query
	};
	opts.qs.access_token = options.accessToken;
	request( opts, function ( err, res, body ) {
		var payload;
		if ( err ) callback ( err );
		if ( res.statusCode === 200 ) {
			try {
				payload = JSON.parse( body );
			} catch ( e ) {
				return callback( e );
			}
			if ( payload ) return callback( null, payload );
		}
		if ( res.statusCode === 401 ) {
			auth = null;
			return this.fetch( options, callback );
		}
		callback( new Error('Unable to fetch events') )
	});
};

Events.prototype.create = function ( options, callback ) {
	var ogPayload = options.payload,
		payload = {
			start : {
				dateTime: ogPayload.start
			},
			end : {
				dateTime: ogPayload.end
			},
			summary : ogPayload.title,
			description : ogPayload.description,
			visibility : 'public',
			status : 'tentative' // everything should be set to a 
			// pending state
		},
		opts = {
			method : options.method,
			url : uriBase + '/calendars/' + this.calId + '/events',
			json : payload,
			qs : {}
		};
	opts.qs.access_token = options.accessToken;
	request( opts, function ( err, res, body ) {
		if ( err ) callback ( err );
		if ( res.statusCode === 200 ) {
			return callback( null, body );
		}
		if ( res.statusCode === 401 ) {
			auth = null;
			return this.fetch( options, callback );
		}
		// should try to parse out error message from server
		callback( new Error('Unable to fetch events') )
	});
}

module.exports = Events;