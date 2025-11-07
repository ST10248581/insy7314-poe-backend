const supabase = require('../client/SupabaseClient');

async function logoutUser(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Delete the refresh token from the database
    const { error } = await supabase
      .from('CustomerTokens')
      .delete()
      .eq('RefreshToken', refreshToken);

    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Failed to revoke session' });
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout controller error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { logoutUser };
