const nodemailer = require("nodemailer");
const smtpPool = require("nodemailer-smtp-pool");

const emailConfig = {
  mailer: {
    service: "Gmail",
    host: "localhost",
    port: "465",
    user: "monet.noti@gmail.com",
    password: "monet1234",
  },
};

const transporter = nodemailer.createTransport(
  smtpPool({
    service: emailConfig.mailer.service,
    host: emailConfig.mailer.host,
    port: emailConfig.mailer.port,
    auth: {
      user: emailConfig.mailer.user,
      pass: emailConfig.mailer.password,
    },
    tls: {
      rejectUnauthorized: false,
    },
    maxConnections: 10,
    maxMessages: 10,
  })
);

function sendNotification(email, newUser = "null") {
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from: emailConfig.mailer.user,
        to: email,
        subject: "[WeBrain] 새로운 유저 가입 안내",
        html: `<h1>새로운 유저 가입 안내</h1>
      <p>새로운 유저(${newUser})가 가입하였습니다. 관리자 페이지에서 확인해주세요.</p>`,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

module.exports = sendNotification;
