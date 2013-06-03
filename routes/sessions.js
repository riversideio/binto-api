var sessions = {
  login: {
    handler: function (request) {
      var email         = encodeURIComponent(request.payload.email);
      var password      = encodeURIComponent(request.payload.password);

      Parse.get("/login.json?username="+email+"&password="+password, function(resp) {
        if (resp.error) {
          request.reply({ success: false, error: {message: resp.error }})
        } else {
          request.reply({ success: true, session_token: resp.sessionToken, id: resp.objectId });
        }
      });
    } 
  }
};

server.route({
  method  : 'POST',
  path    : '/api/v0/sessions.json',
  config  : sessions.login
});
