const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();

// log results
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  next();
});

// Helmet 
app.use(helmet());

// CORS 
app.use(cors({
  origin: 'https://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body Parsing 
app.use(express.json({ limit: '10kb' }));

// Input Protection 
app.use(hpp());

//  Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/payments', transactionRoutes);
app.use('/api/employee', employeeRoutes);

//nHealth Check 
app.get('/', (req, res) => {
  res.send('Secure backend is running 🚀');
});


app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({ error: 'Something went wrong', details: err.message });
});

module.exports = app;
