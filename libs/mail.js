var target = process.env.EMAIL_TARGET;
var domain = process.env.MAILGUN_DOMAIN;
var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: domain
});

// todo: send email to a list people can subscribe to?

function notify(data) {
  var subject = "New snow on " + data['date'] + ": "
    + data['6200-new'] + " at 6200', " + data['8000-new'] + " at 8000'";

  var emailData = {
    from: 'SquawSnow <app@' + domain + '>',
    to: target,
    subject: subject,
    text: JSON.stringify(data, null, 2)
  };

  return new Promise(function (resolve, reject) {
    mailgun.messages().send(emailData, function (error, body) {
      if (error) {
        console.error('Error sending mail', error);
        resolve(false);
      }
      console.log('Sent mail to', target, "-", subject);
      resolve(true);
    });
  });
}

module.exports.notify = notify;
