const { verifyMFA } = require('../controllers/mfaController');
const supabase = require('../client/SupabaseClient');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

jest.mock('../client/SupabaseClient');
jest.mock('jsonwebtoken');
jest.mock('speakeasy');

describe('verifyMFA', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it('should fail if user not found', async () => {
    const mockReq = { body: { username: 'missing', code: '123456', tempToken: 'temp' } };
    jwt.verify.mockReturnValue({ username: 'missing' });
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: 'not found' })
    });

    await verifyMFA(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it('should succeed if MFA is valid', async () => {
    const mockReq = { body: { username: 'john', code: '123456', tempToken: 'temp' } };

    jwt.verify.mockReturnValue({ username: 'john' });
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { FullName: 'John', MFASecret: 'SECRET123' },
        error: null
      }),
      insert: jest.fn().mockResolvedValue({ data: {}, error: null })
    });

    speakeasy.totp.verify.mockReturnValue(true);
    jwt.sign.mockReturnValue('token123');

    await verifyMFA(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'MFA verified successfully!' })
    );
  });
});
