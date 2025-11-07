const bcrypt = require('bcrypt');
const supabase = require('../client/SupabaseClient');
const speakeasy = require('speakeasy');

async function addEmployee(req, res) {
  try {
    let { fullName, username, password } = req.body;

    // Validation
    if (!fullName || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    fullName = fullName.trim();
    username = username.trim().toLowerCase();

    if (username.length < 4 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be between 4 and 30 characters' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Password must include uppercase, lowercase, number, and special character',
      });
    }

    // --- CHECK IF USER EXISTS ---
    const { data: existingUser, error: findError } = await supabase
      .from('Employee')
      .select('Username')
      .eq('Username', username)
      .maybeSingle();

    if (findError) throw findError;
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // --- HASH PASSWORD ---
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- GENERATE MFA SECRET ---
    const mfaSecret = speakeasy.generateSecret({ length: 32 }).base32;

    // --- INSERT INTO DB ---
    const { error: insertError } = await supabase.from('Employee').insert([
      {
        FullName: fullName,
        Username: username,
        Password: hashedPassword
      },
    ]);

    if (insertError) throw insertError;

    res.status(201).json({
      message: 'Employee added successfully',
      mfaSetup: {
        secret: mfaSecret,
        qrSetupInfo: `otpauth://totp/YourApp:${username}?secret=${mfaSecret}&issuer=YourApp`,
      },
    });
  } catch (err) {
    console.error('Add Employee Error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

module.exports = { addEmployee };
