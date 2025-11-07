const { registerUser } = require('../controllers/authController');
const supabase = require('../client/SupabaseClient');
const bcrypt = require('bcrypt');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

// Mock dependencies
jest.mock('../client/SupabaseClient');
jest.mock('bcrypt');
jest.mock('qrcode');
jest.mock('jsonwebtoken');
jest.mock('speakeasy');

describe('registerUser', () => {
  const mockReq = {
    body: {
      fullName: 'Cole Palmer',
      username: 'ColeP',
      idNumber: '1203698547102',
      accountNumber: '1423658798654123',
      password: 'Cole@1234'
    }
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user successfully', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword');
    speakeasy.generateSecret.mockReturnValue({
      base32: 'mocksecret',
      otpauth_url: 'mockurl'
    });
    qrcode.toDataURL.mockResolvedValue('mockqr');
    supabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({ data: {}, error: null })
    });
    jwt.sign.mockReturnValue('mocktoken');

    await registerUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        data: expect.objectContaining({
          username: 'ColeP',
          accessToken: 'mocktoken'
        })
      })
    );
  });
});

/*Code Attribution
Code by Copilot
Link: https://copilot.microsoft.com/shares/PLj2gYXXvpv8HhbuDCosv
Accessed 6 November 2025
const { registerUser } = require('../controllers/authController');
const supabase = require('../client/SupabaseClient');
const bcrypt = require('bcrypt');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

// Mock dependencies
jest.mock('../client/SupabaseClient');
jest.mock('bcrypt');
jest.mock('qrcode');
jest.mock('jsonwebtoken');
jest.mock('speakeasy');

describe('registerUser', () => {
  const mockReq = {
    body: {
      fullName: 'Cole Palmer',
      username: 'ColeP',
      idNumber: '1203698547102',
      accountNumber: '1423658798654123',
      password: 'Cole@1234'
    }
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user successfully', async () => {
    bcrypt.hash.mockResolvedValue('hashedPassword');
    speakeasy.generateSecret.mockReturnValue({
      base32: 'mocksecret',
      otpauth_url: 'mockurl'
    });
    qrcode.toDataURL.mockResolvedValue('mockqr');
    supabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({ data: {}, error: null })
    });
    jwt.sign.mockReturnValue('mocktoken');

    await registerUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        data: expect.objectContaining({
          username: 'ColeP',
          accessToken: 'mocktoken'
        })
      })
    );
  });
});
*/