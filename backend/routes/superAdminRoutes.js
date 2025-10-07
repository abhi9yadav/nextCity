// Routes for Super Administrator operations

const express = require('express');
const router = express.Router();
const { authenticate, roleCheck } = require('../middlewares/firebaseAuthRoleMiddleware');
const superAdminController = require('../controllers/superAdminController');

// All routes below require the user to be authenticated and have the 'super_admin' role.
// The flow: 
// 1. authenticate - Verifies Firebase token, attaches req.user.
// 2. roleCheck - Checks req.user.role === 'super_admin'.

// --- Core Resource Management Routes ---

// Create a new City
router.post('/cities', authenticate, roleCheck(['super_admin']), superAdminController.createCity);
// Create a new Department
router.post('/departments', authenticate, roleCheck(['super_admin']), superAdminController.createDepartment);

// Fetch all cities (for dropdowns when creating City Admins)
router.get('/cities', authenticate, roleCheck(['super_admin']), superAdminController.getAllCities);
// Fetch all departments (for dropdowns when creating Dept Admins)
router.get('/departments', authenticate, roleCheck(['super_admin']), superAdminController.getAllDepartments);

// Fetch all City Admins
router.get('/cityAdmins', authenticate, roleCheck(['super_admin']), superAdminController.getAllCityAdmins);

// --- Delegated User Creation Route ---

router.post('/users/create', authenticate, roleCheck(['super_admin']), superAdminController.createUser);
router.delete('/users/:firebaseUid', authenticate, roleCheck(['super_admin']), superAdminController.deleteUser);
router.patch('/users/:firebaseUid', authenticate, roleCheck(['super_admin']), superAdminController.updateUser);


module.exports = router;
