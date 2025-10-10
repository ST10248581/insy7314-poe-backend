
const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.send('Hello, HTTPS world!');
});

// SSL options
const options = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem'),
};

const PORT = process.env.PORT || 5000;

// Start HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});
