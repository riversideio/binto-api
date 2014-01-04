var request    = require('request');

var Parse = function(app_id, rest_api_key) {
  var root_url      = "https://api.parse.com/1";
      headers       = {
        'X-Parse-Application-Id':   app_id,
        'X-Parse-REST-API-Key':     rest_api_key
      };

  var parse = {
    root_url:     root_url,
    headers:      headers,

    get: function(path, callback) {
      console.log(parse.headers);

      var url     = parse.root_url + path;
      var payload = {
        headers: parse.headers
      };

      return request.get(url, payload, function(error, response, body) {
        var json = JSON.parse(body);
        return callback(json);
      });
    },

    post: function(path, json, callback) {
      var payload = {
        headers:  parse.headers,
        url:      parse.root_url + path,
        json:     json
      };
      
      return request.post(payload, function(error, response, body) {
        return callback(body);
      });
    },

    put: function(path, json, callback) {
      var new_headers = parse.headers;

      if (json.session_token) {
        new_headers["X-Parse-Session-Token"] = json.session_token;
      }
      delete(json.session_token);

      var payload = {
        headers:  new_headers,
        url:      parse.root_url + path,
        json:     json
      };

      return request.put(payload, function(error, response, body) {
        return callback(body);
      });
    }
  }

  return parse;
}

module.exports = Parse;
