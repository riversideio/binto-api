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
      request.Events.fetch( request, function ( err, res ) {
        if ( err ) return request.reply( err );
        request.reply( { 
          success : true,
          event : res
        });
      })
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
