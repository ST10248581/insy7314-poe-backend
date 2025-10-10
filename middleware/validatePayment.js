const { check, validationResult } = require('express-validator');

const validatePayment = [
  check('amount')
    .custom(value => typeof value === 'number' || !isNaN(parseFloat(value)))
    .withMessage('Amount must be a number'),

  check('currency')
    .trim()
    .isIn(['USD', 'EUR', 'GBP', 'ZAR'])
    .withMessage('Invalid currency'),

  check('provider')
    .trim()
    .isIn(['Apple Pay', 'Wise', 'PayPal'])
    .withMessage('Invalid payment provider'),

  check('accountNumber')
    .trim()
    .matches(/^[a-zA-Z0-9]{16}$/)
    .withMessage('Account number must be 16 alphanumeric characters'),

  check('swiftCode')
    .trim()
    .isLength({ min: 8, max: 11 })
    .withMessage('SWIFT code must be 8-11 characters'),

  check('customerName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Customer name must be 2-50 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validatePayment };

/*
Code Attribution
Code by Kuhlmann, A. and Verma, S.
Link:https://stackoverflow.com/questions/55772477/how-to-implement-validation-in-a-separate-file-using-express-validator
Accessed: 8 October 2025

const {check, validationResult} = require('express-validator');

exports.validateUser = [
  check('name')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('User name can not be empty!')
    .bail()
    .isLength({min: 3})
    .withMessage('Minimum 3 characters required!')
    .bail(),
  check('email')
    .trim()
    .normalizeEmail()
    .not()
    .isEmpty()
    .withMessage('Invalid email address!')
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});
    next();
  },
];
 */