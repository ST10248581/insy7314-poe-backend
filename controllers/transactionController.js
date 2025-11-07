const supabase = require('../client/SupabaseClient');

const submitTransaction = async (req, res) => {
  try {
    const { amount, currency, provider, accountNumber, swiftCode, customerName } = req.body;

    console.log('Incoming payload:', req.body);
    console.log('Supabase client is:', typeof supabase);

    if (!amount || !currency || !provider || !accountNumber || !swiftCode || !customerName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          amount: parseFloat(amount),
          currency,
          provider,
          account_number: accountNumber,
          swift_code: swiftCode,
          customer_name: customerName,
          status: 'Pending'
        }
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to store transaction', details: error.message });
    }

    res.status(200).json({ message: 'Transaction stored successfully', data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { customerName } = req.query;

    if (!customerName) {
      return res.status(400).json({ error: 'Missing customerName' });
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('customer_name', customerName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all transactions for employees
const getAllTransactions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch all error:', error);
      return res.status(500).json({ error: 'Failed to fetch all transactions' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  submitTransaction,
  getTransactions,
  getAllTransactions
};
