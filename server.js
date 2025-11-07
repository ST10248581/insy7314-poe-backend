const fs = require('fs');
const https = require('https');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Load SSL certificate and key
const privateKey = fs.readFileSync('./cert/localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('./cert/localhost.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  console.log(`Secure server running at https://localhost:${PORT}`);
});