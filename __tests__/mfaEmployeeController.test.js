const { generateEmployeeMFA, verifyEmployeeMFA } = require('../controllers/mfaEmployeeController');
const supabase = require('../client/SupabaseClient');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

jest.mock('../client/SupabaseClient');
jest.mock('jsonwebtoken');
jest.mock('speakeasy');
jest.mock('qrcode');

describe('mfaEmployeeController', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it('should generate MFA if employee exists', async () => {
    const mockReq = { body: { username: 'Jane' } };

    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { MFASecret: 'EXISTINGSECRET' }, error: null }),
      update: jest.fn()
    });

    QRCode.toDataURL.mockResolvedValue('data:image/png;base64,abc123');

    await generateEmployeeMFA(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ qrCode: 'data:image/png;base64,abc123' })
    );
  });

  it('should verify employee MFA successfully', async () => {
    const mockReq = { body: { username: 'Jane', code: '654321', tempToken: 'temp' } };

    jwt.verify.mockReturnValue({ username: 'Jane' });

    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { MFASecret: 'SECRETXYZ', FullName: 'Jane Doe', Role: 'Employee' },
        error: null
      }),
      insert: jest.fn().mockResolvedValue({ data: {}, error: null })
    });

    speakeasy.totp.verify.mockReturnValue(true);
    jwt.sign.mockReturnValue('token123');

    await verifyEmployeeMFA(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'MFA verified successfully!' })
    );
  });
});
