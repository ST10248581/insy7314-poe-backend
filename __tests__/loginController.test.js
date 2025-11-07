const { loginUser } = require('../controllers/loginController');
const supabase = require('../client/SupabaseClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../client/SupabaseClient');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('loginUser', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fail if user not found', async () => {
    const mockReq = { body: { username: 'notfound', password: 'pass' } };

    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: 'User not found' })
    });

    await loginUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid username or password' })
    );
  });

  it('should login successfully', async () => {
    const mockReq = { body: { username: 'ColeP', password: 'Cole@1234' } };

    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { FullName: 'Cole Palmer', Password: 'hashed' },
        error: null
      })
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('tempToken123');

    await loginUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Password correct - please verify MFA.'
      })
    );
  });
});
