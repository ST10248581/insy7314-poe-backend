const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const supabase = require('../client/SupabaseClient');
const SALT_ROUNDS = 12;

// JWT secrets (store securely in .env)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

async function registerUser(req, res) {
  const { fullName, username, idNumber, accountNumber, password } = req.body;

  try {
    // Validate Password Strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|;:'",.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.',
      });
    }

    // Hash + Salt Password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create MFA Secret
    const mfaSecret = speakeasy.generateSecret({
      name: `YourApp (${username})`, // Name shown in Authenticator
    });

    // Generate QR Code for Authenticator Setup
    const qrCodeUrl = await qrcode.toDataURL(mfaSecret.otpauth_url);

    // Store user securely in Supabase
    const { data, error } = await supabase.from('Customer').insert([
      {
        FullName: fullName,
        Username: username,
        IDNumber: idNumber,
        AccountNumber: accountNumber,
        Password: hashedPassword,
        MFASecret: mfaSecret.base32,
      },
    ]);

    if (error) throw error;

    // Create JWT Tokens
    const accessToken = jwt.sign(
      { username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' } // short-lived token
    );

    const refreshToken = jwt.sign(
      { username },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' } // long-lived refresh token
    );

    // Store refresh token in DB for logout/revocation
    await supabase
      .from('CustomerTokens')
      .insert([{ Username: username, RefreshToken: refreshToken }]);

    // Respond Securely
    res.status(201).json({
      message: 'User registered successfully with MFA setup.',
      data: {
        username,
        qrCodeUrl, // show this once during registration
        mfaSetupKey: mfaSecret.base32, // optional if you want to show backup key
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { registerUser };
