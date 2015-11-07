var mailgun = null;

try {
  // the heroku addon sets MAILGUN_SMTP_LOGIN, so just pull the domain from there
  var domain = process.env.MAILGUN_SMTP_LOGIN.split('@')[1];
  var target = process.env.EMAIL_TARGET;

  mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: domain
  });
} catch (e) {
  console.error("Unable to configure mail: ", e);
}

// todo: send email to a list people can subscribe to?

function notify(data) {
  if (mailgun === null) {
    console.error('Mail not configured, so can not send.');
    return;
  }
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
