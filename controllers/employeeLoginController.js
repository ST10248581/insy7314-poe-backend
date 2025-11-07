const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../client/SupabaseClient');
const { body, validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// ✅ Validation
const validateEmployeeLogin = [
  body('username').trim().notEmpty().isLength({ min: 3 }),
  body('password').notEmpty().isLength({ min: 6 }),
];

// ✅ Employee Login
async function employeeLogin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;

  try {
    const { data: employee, error } = await supabase
      .from('Employee')
      .select('FullName, Password, MFASecret')
      .eq('Username', username)
      .single();

    if (error || !employee)
      return res.status(401).json({ error: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, employee.Password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid username or password' });

    // ✅ If MFA not set up yet → generate secret and return QR
    if (!employee.MFASecret) {
      const secret = speakeasy.generateSecret({
        name: `IntlBank Employee (${username})`,
      });

      await supabase
        .from('Employee')
        .update({ MFASecret: secret.base32 })
        .eq('Username', username);

      const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

      return res.status(200).json({
        message: 'MFA setup required',
        setup: true,
        qrCode: qrCodeDataURL,
      });
    }

    // If MFA already set → ask to verify code
    res.status(200).json({
      message: 'MFA verification required',
      setup: false,
      tempToken: jwt.sign({ username }, ACCESS_TOKEN_SECRET, { expiresIn: '5m' }),
    });
  } catch (err) {
    console.error('Employee login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
}

// Verify Employee MFA
async function verifyEmployeeMFA(req, res) {
  const { username, code, tempToken } = req.body;

  try {
    const decoded = jwt.verify(tempToken, ACCESS_TOKEN_SECRET);
    if (decoded.username !== username)
      return res.status(403).json({ error: 'Invalid session' });

    const { data: employee } = await supabase
      .from('Employee')
      .select('MFASecret, FullName, Role')
      .eq('Username', username)
      .single();

    if (!employee)
      return res.status(404).json({ error: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: employee.MFASecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified)
      return res.status(401).json({ error: 'Invalid MFA code' });

    const accessToken = jwt.sign(
      { username, role: employee.Role, isEmployee: true },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { username, role: employee.Role, isEmployee: true },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    await supabase.from('EmployeeTokens').insert([{ Username: username, RefreshToken: refreshToken }]);

    res.status(200).json({
      message: 'MFA verified successfully',
      user: { fullName: employee.FullName },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('MFA verification error:', err);
    res.status(500).json({ error: 'Failed to verify MFA' });
  }
}

module.exports = { employeeLogin, verifyEmployeeMFA, validateEmployeeLogin };
