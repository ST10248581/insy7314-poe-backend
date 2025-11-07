const { logoutUser } = require('../controllers/logoutController');
const supabase = require('../client/SupabaseClient');

jest.mock('../client/SupabaseClient');

describe('logoutUser', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  it('should require refresh token', async () => {
    const mockReq = { body: {} };
    await logoutUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should log out successfully', async () => {
    const mockReq = { body: { refreshToken: 'token123' } };
    supabase.from.mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({ error: null })
      })
    });

    await logoutUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Logged out successfully'
    });
  });
});
