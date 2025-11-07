const bcrypt = require('bcrypt');
const supabase = require('./client/SupabaseClient');
const speakeasy = require('speakeasy');

async function seedEmployee() {
  try {
    const fullName = 'John Doe';
    const username = 'johndoe';
    const password = 'John@1234'; // strong password

    // Check if employee already exists
    const { data: existingUser, error: findError } = await supabase
      .from('Employee')
      .select('Username')
      .eq('Username', username)
      .maybeSingle();

    if (findError) throw findError;
    if (existingUser) {
      console.log('Employee already exists! No need to seed.');
      return;
    }

    // Generate MFA secret
    const mfaSecret = speakeasy.generateSecret({ length: 32 }).base32;

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert employee
    const { error: insertError } = await supabase.from('Employee').insert([
      {
        FullName: fullName.trim(),
        Username: username.trim().toLowerCase(),
        Password: hashedPassword,
        MFASecret: mfaSecret,
      },
    ]);

    if (insertError) throw insertError;

    console.log(`Seeded employee successfully!`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   MFA Secret: ${mfaSecret}`);
  } catch (err) {
    console.error('❌ Error seeding employee:', err.message);
  }
}

seedEmployee();
