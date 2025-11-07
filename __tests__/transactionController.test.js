const { submitTransaction, getTransactions } = require('../controllers/transactionController');
const supabase = require('../client/SupabaseClient');

jest.mock('../client/SupabaseClient');

describe('transactionController', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it('should reject missing fields on submit', async () => {
    const mockReq = { body: { amount: 100 } };
    await submitTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should insert transaction successfully', async () => {
    const mockReq = {
      body: {
        amount: 100,
        currency: 'USD',
        provider: 'PayPal',
        accountNumber: '12345',
        swiftCode: 'ABCXYZ',
        customerName: 'John'
      }
    };

    supabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
    });

    await submitTransaction(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should fetch transactions successfully', async () => {
    const mockReq = { query: { customerName: 'John' } };

    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null })
    });

    await getTransactions(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
