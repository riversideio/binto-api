var messenger   = require('../messenger');
var _sendgrid   = require('sendgrid');
var sendgrid;

messenger.on('user:created', function(data) {
  console.log(data);
  sendgrid.send({
    to: 'dude@mailinator.com',
    from: 'dude@mailinator.com',
    subject: 'test',
    text: 'text'
  }, function(err, json) {
    console.log(arguments);
  });
});

var email = function(sendgrid_username, sendgrid_password) {
  sendgrid = _sendgrid(sendgrid_username, sendgrid_password);
}

module.exports = email;
