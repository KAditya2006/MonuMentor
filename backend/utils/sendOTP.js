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
  // 1. MOBILE SMS DISPATCHER (FAST2SMS API)
  console.log(`\n======================================================`);
  const fast2smsKey = process.env.FAST2SMS_API_KEY;

  if (!fast2smsKey) {
     console.log(`⚠️ [FAST2SMS] API Key is missing! Add FAST2SMS_API_KEY to your .env file.`);
     console.log(`💬 Fallback Terminal Mock Message: "Your Roots & Wings verification code is: ${otp}"`);
     console.log(`======================================================\n`);
  } else {
     console.log(`📲 [FAST2SMS] Attempting to deliver REAL SMS to Mobile: ${mobile}...`);

     const fast2smsData = JSON.stringify({
       route: 'q',
       message: `Your Roots & Wings Registration OTP is: ${otp}. Do not share this code with anyone.`,
       flash: 0,
       numbers: mobile
     });

     const fast2smsOptions = {
       hostname: 'www.fast2sms.com',
       port: 443,
       path: '/dev/bulkV2',
       method: 'POST',
       headers: {
         'authorization': fast2smsKey,
         'Content-Type': 'application/json',
         'Content-Length': Buffer.byteLength(fast2smsData)
       }
     };

     const req = https.request(fast2smsOptions, (res) => {
       let body = '';
       res.on('data', d => body += d);
       res.on('end', () => {
         try {
           const result = JSON.parse(body);
           if (result.return === true) {
             console.log(`✅ [FAST2SMS] Live OTP Successfully Delivered to ${mobile}!!`);
           } else {
             console.log(`⚠️ [FAST2SMS REJECTED] ${result.message}`);
             console.log(`💬 Fallback Terminal Message: ${otp}`);
           }
           console.log(`======================================================\n`);
         } catch (e) {
           console.log(`⚠️ [FAST2SMS ERR] Parse failure. Fallback OTP is: ${otp}\n======================================================\n`);
         }
       });
     });

     req.on('error', (e) => {
       console.log(`⚠️ [FAST2SMS NETWORK ERR] ${e.message}. Fallback OTP is: ${otp}\n======================================================\n`);
     });
     
     req.write(fast2smsData);
     req.end();
  }

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
