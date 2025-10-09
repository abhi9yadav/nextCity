const express = require('express');
const router = express.Router();
const { authenticate, roleCheck } = require('../middlewares/firebaseAuthRoleMiddleware');
const superAdminController = require('../controllers/superAdminController');
const invitationController = require('../controllers/invitationController');

// Create a new City
router.post('/cities', authenticate, roleCheck(['super_admin']), superAdminController.createCity);
// Create a new Department
router.post('/departments', authenticate, roleCheck(['super_admin']), superAdminController.createDepartment);

// Fetch all cities
router.get('/cities', authenticate, roleCheck(['super_admin']), superAdminController.getAllCities);
// Fetch all departments 
router.get('/departments', authenticate, roleCheck(['super_admin']), superAdminController.getAllDepartments);

// Fetch all City Admins
router.get('/cityAdmins', authenticate, roleCheck(['super_admin']), superAdminController.getAllCityAdmins);

router.post('/users/create', authenticate, roleCheck(['super_admin']), superAdminController.createUser);
router.delete('/users/:firebaseUid', authenticate, roleCheck(['super_admin']), superAdminController.deleteUser);
router.patch('/users/:firebaseUid', authenticate, roleCheck(['super_admin']), superAdminController.updateUser);
router.post('/users/:firebaseUid/resend-invitation', authenticate, roleCheck(['super_admin']), invitationController.resendInvitation);

module.exports = router;
