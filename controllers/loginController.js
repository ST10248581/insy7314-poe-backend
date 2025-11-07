const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const supabase = require('../client/SupabaseClient');

// JWT secrets (must match register controller)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

async function loginUser(req, res) {
  const { username, password } = req.body;

  const { data: user, error } = await supabase
    .from('Customer')
    .select('FullName, Password')
    .eq('Username', username)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isMatch = await bcrypt.compare(password, user.Password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // generate a temporary JWT good for ~2 minutes
  const tempToken = jwt.sign({ username }, ACCESS_TOKEN_SECRET, { expiresIn: '2m' });

  // tell frontend to ask for MFA now
  res.status(200).json({
    message: 'Password correct - please verify MFA.',
    tempToken,
  });
}


module.exports = { loginUser };
