const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const supabase = require('../client/SupabaseClient');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

async function verifyMFA(req, res) {
  const { username, code, tempToken } = req.body;

  try {
    // verify the temp token first
    jwt.verify(tempToken, ACCESS_TOKEN_SECRET);

    const { data: user, error } = await supabase
      .from('Customer')
      .select('FullName, MFASecret')
      .eq('Username', username)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    const isMfaValid = speakeasy.totp.verify({
      secret: user.MFASecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isMfaValid) return res.status(401).json({ error: 'Invalid MFA code' });

    const accessToken = jwt.sign({ username }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ username }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    await supabase.from('CustomerTokens').insert([{ Username: username, RefreshToken: refreshToken }]);

    res.status(200).json({
      message: 'MFA verified successfully!',
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(401).json({ error: 'Session expired or invalid temp token' });
  }
}


module.exports = { verifyMFA };
