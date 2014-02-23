var events = {
  all: {
    handler : function ( request ) {
      request.Events.fetch( request, function ( err, res ) {
        if ( err ) return request.reply( err );
        request.reply( { 
          success : true,
          events : res.items
        });
      })
    }
  },
  create: {
    handler : function ( request ) {
      var _user = {
        session_token : request.payload.session_token
      };

      function createEvent ( ) {
        request.Events.fetch( request, function ( err, res ) {
          if ( err ) return request.reply( err );
          request.reply( { 
            success : true,
            event : res
          });
        });
      }

      if ( !request.payload.organizer ) {
        return request.Parse.get('/users/me.json', _user, function ( resp ){
          var email;
          if (resp.error) return request.reply({
            success: false, 
            error: {message: resp.error}
          });
          request.payload.organizer = resp.email;
          createEvent( );
        });
      }

      createEvent( );
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: '/api/v0/events.json',
    config: events.all
  },
  {
    method: 'POST',
    path: '/api/v0/events.json',
    config: events.create
  }
];
