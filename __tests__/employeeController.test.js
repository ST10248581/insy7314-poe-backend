const { addEmployee } = require('../controllers/employeeController');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const supabase = require('../client/SupabaseClient');

jest.mock('../client/SupabaseClient');
jest.mock('bcrypt');
jest.mock('speakeasy');

describe('addEmployee', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { fullName: 'John Doe', username: 'johndoe', password: 'Password@123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test('should return 400 if fields are missing', async () => {
    req.body = {};
    await addEmployee(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'All fields are required' });
  });

  test('should return 409 if username already exists', async () => {
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: { Username: 'johndoe' }, error: null }),
    });

    await addEmployee(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Username already exists' });
  });

  test('should create employee successfully', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed');
    speakeasy.generateSecret.mockReturnValue({ base32: 'mocksecret' });

    await addEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Employee added successfully',
      })
    );
  });
});

/*Code Attribution
Code by Copilot
Link: https://copilot.microsoft.com/shares/PLj2gYXXvpv8HhbuDCosv
Accessed 6 November 2025
const { addEmployee } = require('../controllers/employeeController');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const supabase = require('../client/SupabaseClient');

jest.mock('../client/SupabaseClient');
jest.mock('bcrypt');
jest.mock('speakeasy');

describe('addEmployee', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { fullName: 'John Doe', username: 'johndoe', password: 'Password@123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test('should return 400 if fields are missing', async () => {
    req.body = {};
    await addEmployee(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'All fields are required' });
  });

  test('should return 409 if username already exists', async () => {
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: { Username: 'johndoe' }, error: null }),
    });

    await addEmployee(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Username already exists' });
  });

  test('should create employee successfully', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed');
    speakeasy.generateSecret.mockReturnValue({ base32: 'mocksecret' });

    await addEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Employee added successfully',
      })
    );
  });
});
*/