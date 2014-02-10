module.exports = [
    {
	    method  : 'GET',
	    path    : '/api/v0/events.json',
	    config  : {
			handler : function ( request ) {
				request.Events.fetch( request, function ( err, res ) {
					if ( err ) return request.reply( err );
					request.reply( { 
						success : true,
						events : res.items
					});
				})
			}
		}
    },
    {
	    method  : 'POST',
	    path    : '/api/v0/events.json',
	    config  : {
			handler : function ( request ) {

				request.Events.fetch( request, function ( err, res ) {
					if ( err ) return request.reply( err );
					console.log( res );
					request.reply( { 
						success : true,
						event : res
					});
				})
			}
		}
    }
];
