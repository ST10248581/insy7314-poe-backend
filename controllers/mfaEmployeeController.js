const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const supabase = require('../client/SupabaseClient');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Generate MFA secret & QR for an employee
async function generateEmployeeMFA(req, res) {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    const { data: employee, error } = await supabase
      .from('Employee')
      .select('MFASecret')
      .eq('Username', username)
      .single();

    if (error || !employee) return res.status(404).json({ error: 'Employee not found' });

    let secretObj;
    if (!employee.MFASecret) {
      secretObj = speakeasy.generateSecret({ name: `IntlBank Employee (${username})` });
      await supabase.from('Employee').update({ MFASecret: secretObj.base32 }).eq('Username', username);
    } else {
      secretObj = {
        base32: employee.MFASecret,
        otpauth_url: `otpauth://totp/${encodeURIComponent(`IntlBank Employee (${username})`)}?secret=${employee.MFASecret}`
      };
    }

    const qrCodeDataURL = await QRCode.toDataURL(secretObj.otpauth_url);

    res.status(200).json({ secret: secretObj.base32, qrCode: qrCodeDataURL });
  } catch (err) {
    console.error('MFA generation error:', err);
    res.status(500).json({ error: 'Server error generating MFA' });
  }
}

// Verify MFA
async function verifyEmployeeMFA(req, res) {
  try {
    const { username, code, tempToken } = req.body;
    if (!username || !code || !tempToken) return res.status(400).json({ error: 'Missing fields' });

    const decoded = jwt.verify(tempToken, ACCESS_TOKEN_SECRET);
    if (decoded.username !== username) return res.status(403).json({ error: 'Invalid session' });

    const { data: employee, error } = await supabase
      .from('Employee')
      .select('MFASecret, FullName')
      .eq('Username', username)
      .single();

    if (error || !employee) return res.status(404).json({ error: 'Employee not found' });

    const verified = speakeasy.totp.verify({
      secret: employee.MFASecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) return res.status(401).json({ error: 'Invalid MFA code' });

    const accessToken = jwt.sign({ username, role: employee.Role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ username, role: employee.Role }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    await supabase.from('EmployeeTokens').insert([{ Username: username, RefreshToken: refreshToken }]);

    res.status(200).json({
      message: 'MFA verified successfully!',
      user: { fullName: employee.FullName },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('MFA verify error:', err);
    res.status(401).json({ error: 'Session expired or invalid temp token' });
  }
}

module.exports = { generateEmployeeMFA, verifyEmployeeMFA };
