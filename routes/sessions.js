
var sessions = {
  login: {
    handler: function (request) {
      var email         = encodeURIComponent(request.payload.email);
      var password      = encodeURIComponent(request.payload.password);

      request.Parse.get("/login.json?username="+email+"&password="+password, function(resp) {
        if (resp.error) {
          request.reply({ success: false, error: {message: resp.error }})
        } else {
          var user = {
            id:               resp.objectId,
            email:            resp.email,
            zip :             resp.zip,
            session_token:    resp.sessionToken
          };
          
          request.reply({ success: true, user: user });
        }
      });
    }
  }
};

module.exports = [
  {
    method  : 'POST',
    path    : '/api/v0/sessions.json',
    config  : sessions.login
  }
];
