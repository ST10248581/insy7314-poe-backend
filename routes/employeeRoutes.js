const express = require('express');
const router = express.Router();

const { employeeLogin, validateEmployeeLogin } = require('../controllers/employeeLoginController');
const { addEmployee } = require('../controllers/employeeController');

const { verifyEmployeeMFA, generateEmployeeMFA } = require('../controllers/mfaEmployeeController');

router.post('/employee-login', validateEmployeeLogin, employeeLogin);
router.post('/add-employee', addEmployee);
router.post('/generate-employeemfa', generateEmployeeMFA);
router.post('/verify-employeemfa', verifyEmployeeMFA);

module.exports = router;
