const mongoose = require('mongoose');
const Activity = require('./models/activity');

mongoose.connect('mongodb://localhost:27017/emailreportgen')
  .then(async () => {
    console.log("✅ DB connected. Seeding data...");

    await Activity.insertMany([
      { username: 'alice', action: 'login' },
      { username: 'bob', action: 'uploaded file' },
      { username: 'alice', action: 'logout' },
      { username: 'charlie', action: 'deleted file' },
    ]);

    console.log("🌱 Test data inserted.");
    mongoose.disconnect();
  })
  .catch(err => console.error("❌ Error:", err));
