/** The intention of this file is to load all the routes
  * the convention is that a when requiring a route the
  * it is an array of routes 
  * https://github.com/spumko/hapi/blob/master/docs/Reference.md#serverrouteroutes
  */

module.exports = function ( callback ) {
  var fs = require('fs');

  fs.readdir( __dirname, function ( err, files ) {

    if ( err && !files ) {
      callback( err );
    }

    var routes = [];
    files.forEach(function ( value, index ) {
      // if its not this file and also a js file
      if ( !(/index/.test(value)) && /.js/.test(value)  ) {
        var pack = require( './' + value );
        if ( Array.isArray( pack ) ) {
          routes = routes.concat( pack );
        }      
      }
    });
    callback( null, routes );
  })
}
