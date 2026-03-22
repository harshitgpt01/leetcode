const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  }
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"CodeCurse ☠" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your CodeCurse OTP Code',
    html: `
      <div style="font-family:monospace;background:#03020a;color:#ede8ff;padding:40px;max-width:480px;border-radius:12px;border:1px solid rgba(255,45,45,0.2)">
        <h2 style="color:#ff2d2d;margin-bottom:8px">☠ CodeCurse</h2>
        <p style="color:#5a5472;margin-bottom:24px">Break The Curse. Master The Code.</p>
        <p style="margin-bottom:16px">Your OTP to verify your email:</p>
        <div style="background:#0e0d1a;border:1px solid rgba(255,45,45,0.3);border-radius:10px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:#ff6a1a;letter-spacing:12px;font-size:42px;margin:0">${otp}</h1>
        </div>
        <p style="color:#5a5472;font-size:12px">Expires in <strong style="color:#ede8ff">10 minutes</strong>.</p>
        <p style="color:#5a5472;font-size:12px">If you did not request this, ignore this email.</p>
      </div>
    `
  });
};

module.exports = sendOTP;