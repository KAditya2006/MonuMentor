const nodemailer = require('nodemailer');
const https = require('https');

// Initialize Transporter using Ethereal (Free Fake SMTP for testing) or Gmail if credentials exist
let transporter;

async function initTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Generate test SMTP service account from ethereal.email if no real env vars supplied
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass  // generated ethereal password
      }
    });
    console.log(`[OTP] Nodemailer Ethereal Test Account Created: ${testAccount.user}`);
  }
}
initTransporter();

/**
 * Dispatches the OTP securely to the user's email and mocks SMS delivery.
 * @param {string} email 
 * @param {string} mobile 
 * @param {string} otp 
 */
async function dispatchDualChannelOTP(email, mobile, otp) {
  // 1. MOBILE SMS DISPATCHER (TEXTBELT FREE PUBLIC API)
  console.log(`\n======================================================`);
  console.log(`📲 Attempting to send REAL SMS to Mobile: ${mobile} via Textbelt...`);
  
  const textbeltData = JSON.stringify({
    phone: mobile,
    message: `Your Roots & Wings verification code is: ${otp}`,
    key: 'textbelt', // Grants 1 Free SMS per IP per Day
  });

  const textbeltOptions = {
    hostname: 'textbelt.com',
    port: 443,
    path: '/text',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(textbeltData)
    }
  };

  const req = https.request(textbeltOptions, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      try {
        const result = JSON.parse(body);
        if (result.success) {
          console.log(`✅ [TEXTBELT] Successfully delivered real SMS to ${mobile}!!`);
        } else {
          console.log(`⚠️ [TEXTBELT FATAL] Free SMS Quota exceeded or failed: ${result.error}`);
          console.log(`💬 Fallback Terminal Mock Message: "Your Roots & Wings verification code is: ${otp}"`);
        }
        console.log(`======================================================\n`);
      } catch (e) {
        console.log(`⚠️ [TEXTBELT PARSE ERROR] Failed to hit SMS API. Fallback Message: ${otp}\n======================================================\n`);
      }
    });
  });

  req.on('error', (e) => {
    console.log(`⚠️ [TEXTBELT ERROR] ${e.message}. Fallback Message: ${otp}\n======================================================\n`);
  });
  
  req.write(textbeltData);
  req.end();

  // 2. EMAIL DISPATCHER (ETHEREAL FREE PUBLIC API)
  try {
    if (!transporter) await initTransporter();
    let info = await transporter.sendMail({
      from: '"Roots & Wings Auth" <no-reply@rootswings.com>',
      to: email,
      subject: "Your Registration Verification OTP",
      text: `Welcome to Roots & Wings! Your verification code is: ${otp}. This code is valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Roots & Wings Verification</h2>
          <p>Please enter the following 6-digit code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; color: #FF9933; letter-spacing: 5px; margin: 20px 0;">${otp}</div>
          <p>This code is valid for 10 minutes. Do not share this code.</p>
        </div>
      `
    });
    console.log(`📧 [EMAIL] OTP officially dispatched to ${email}`);
    if (info.messageId && info.messageId.includes('ethereal')) {
       console.log(`[ETHEREAL MAIL URL] Preview Email Here: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send OTP to ${email}:`, err.message);
  }
}

module.exports = { dispatchDualChannelOTP };
