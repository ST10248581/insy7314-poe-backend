// server.js
const express = require('express');
const https = require('https');
const fs = require('fs');
const ExpressBrute = require('express-brute');

const app = express();

// If you are behind a proxy (nginx, cloud provider), enable this so req.ip is correct:
app.set('trust proxy', 1);

// Middleware
app.use(express.json());

// -------------------- express-brute setup (MemoryStore - dev only) --------------------
const store = new ExpressBrute.MemoryStore(); // dev only. Use Redis store in production.
const failureCallback = (req, res, next, nextValidRequestDate) => {
  // nextValidRequestDate is a timestamp (ms) when the user may try again
  const retryAfterSeconds = Math.max(1, Math.ceil((nextValidRequestDate - Date.now()) / 1000));
  res.set('Retry-After', String(retryAfterSeconds));
  return res.status(429).json({
    error: 'Too many attempts. Please try again later.',
    retryAfterSeconds,
  });
};

const bruteforce = new ExpressBrute(store, {
  freeRetries: 4,           // number of free attempts
  minWait: 1 * 60 * 1000,   // 1 minute initial wait
  maxWait: 60 * 60 * 1000,  // up to 1 hour wait
  lifetime: 60 * 60,        // store lifetime in seconds (1 hour)
  failCallback: failureCallback,
});
// ------------------------------------------------------------------------------------

// Basic test route
app.get('/', (req, res) => {
  res.send('Hello, HTTPS world!');
});

// Example: protected login endpoint
// Use bruteforce.prevent as middleware to count/limit attempts per IP by default
app.post('/api/auth/login', bruteforce.prevent, async (req, res) => {
  const { username, password } = req.body;

  // ---- replace this with your real auth logic ----
  const isValid = username === 'alice' && password === 'password123';
  // ------------------------------------------------

  if (!isValid) {
    // Failed login. express-brute has already consumed an attempt.
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // On successful login: reset the brute counter for this requester
  // Default key is based on IP; in some stores it also accepts req/res. We use req.ip here.
  bruteforce.reset(req.ip, (err) => {
    if (err) {
      console.warn('express-brute reset error:', err);
      // continue anyway — we don't want to block successful login responses
    }
    // Send success response (token/session)
    return res.json({ ok: true, token: 'REPLACE_WITH_JWT_OR_SESSION' });
  });
});

// SSL options — make sure paths match your certs
const options = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem'),
};

const PORT = process.env.PORT || 5000;

// Start HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});
