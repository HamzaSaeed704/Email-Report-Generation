require('dotenv').config();

const mongoose = require('mongoose');
const { parentPort } = require('worker_threads');
const Activity = require('./models/activity');
const Report = require('./models/report');
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO;

console.log("EMAIL_USER:", EMAIL_USER);
console.log("EMAIL_PASS:", EMAIL_PASS ? "✅ Loaded" : "❌ Missing");
console.log("EMAIL_TO:", EMAIL_TO);


// Connect to DB
mongoose.connect('mongodb://localhost:27017/emailreportgen')
  .then(async () => {
    parentPort.postMessage('✅ Worker connected to DB');

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivities = await Activity.find({ timestamp: { $gte: yesterday } });

    const summary = {
      totalActions: recentActivities.length,
      users: [...new Set(recentActivities.map(a => a.username))],
      details: recentActivities.map(a => `${a.username} - ${a.action} @ ${a.timestamp.toLocaleString()}`)
    };

    const reportText = `
Daily Activity Summary Report
-----------------------------
Total Actions: ${summary.totalActions}
Users Involved: ${summary.users.join(', ')}

Details:
${summary.details.join('\n')}
    `;

    // Save report in DB
    const report = new Report({
      title: 'Daily Activity Summary',
      content: reportText
    });
    await report.save();

    parentPort.postMessage('📝 Report saved to DB');

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: EMAIL_TO,
      subject: 'Daily Activity Report',
      text: reportText,
    };

    await transporter.sendMail(mailOptions);
    parentPort.postMessage('📧 Email sent successfully');

    mongoose.disconnect();
  })
  .catch(err => {
    parentPort.postMessage('❌ Error: ' + err.message);
    mongoose.disconnect();
  });
