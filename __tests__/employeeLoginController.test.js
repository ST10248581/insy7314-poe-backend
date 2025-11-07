const { employeeLogin } = require('../controllers/employeeLoginController');
const bcrypt = require('bcrypt');
const supabase = require('../client/SupabaseClient');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

jest.mock('../client/SupabaseClient');
jest.mock('bcrypt');
jest.mock('speakeasy');
jest.mock('qrcode');

describe('employeeLogin', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { username: 'johndoe', password: 'Password@123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test('should return 401 if username not found', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    await employeeLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid username or password' });
  });

  test('should return MFA setup if MFASecret not set', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { FullName: 'John', Password: 'hashed', MFASecret: null },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
    });

    bcrypt.compare.mockResolvedValue(true);
    speakeasy.generateSecret.mockReturnValue({ base32: 'abc123', otpauth_url: 'mockurl' });
    QRCode.toDataURL.mockResolvedValue('mockQr');

    await employeeLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        setup: true,
        qrCode: 'mockQr',
      })
    );
  });
});


/*Code Attribution
Code by Copilot
Link: https://copilot.microsoft.com/shares/PLj2gYXXvpv8HhbuDCosv
Accessed 6 November 2025
const { employeeLogin } = require('../controllers/employeeLoginController');
const bcrypt = require('bcrypt');
const supabase = require('../client/SupabaseClient');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

jest.mock('../client/SupabaseClient');
jest.mock('bcrypt');
jest.mock('speakeasy');
jest.mock('qrcode');

describe('employeeLogin', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { username: 'johndoe', password: 'Password@123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test('should return 401 if username not found', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    await employeeLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid username or password' });
  });

  test('should return MFA setup if MFASecret not set', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { FullName: 'John', Password: 'hashed', MFASecret: null },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
    });

    bcrypt.compare.mockResolvedValue(true);
    speakeasy.generateSecret.mockReturnValue({ base32: 'abc123', otpauth_url: 'mockurl' });
    QRCode.toDataURL.mockResolvedValue('mockQr');

    await employeeLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        setup: true,
        qrCode: 'mockQr',
      })
    );
  });
});
*/