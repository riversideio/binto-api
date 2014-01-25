var checkins = {
  create: {
    handler: function(request) {
      var checkin = request.payload;

      request.Parse.post("/classes/Checkin.json", checkin, function(resp) {
        if (resp.error) {
          request.reply({success: false, error: {message: resp.error}});
        } else {
          request.reply({success: true, checkin: checkin});
        }
      });
    }
  }
}

module.exports = [{
  method: 'POST',
  path: '/api/v0/checkins.json',
  config: checkins.create
}];
