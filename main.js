const express = require('express');
const { Worker } = require('worker_threads');
const mongoose = require('mongoose');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/emailreportgen')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Homepage route
app.get('/', (req, res) => {
  res.send('✅ Welcome to the Email Report Generator API. Visit /generate-report to start.');
});

// Background worker route
app.get('/generate-report', (req, res) => {
  const worker = new Worker('./worker.js');

  worker.on('message', msg => console.log('Worker:', msg));
  worker.on('error', err => console.error('Worker error:', err));
  worker.on('exit', code => console.log('Worker exited with code', code));

  res.send('Report generation started in background!');
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
