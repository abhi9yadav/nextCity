const express = require('express');
const router = express.Router();
const { authenticate, roleCheck } = require('../middlewares/firebaseAuthRoleMiddleware');
const workerController = require('../controllers/workerController');

router.get(
    '/complaints',
    authenticate,
    roleCheck(['worker']),
    workerController.getMyAssignedComplaints
);


router.get(
    '/stats',
    authenticate,
    roleCheck(['worker']),
    workerController.getWorkerStats
);


router.patch(
    '/complaints/:id/status',
    authenticate,
    roleCheck(['worker']),
    workerController.updateComplaintStatus
);

module.exports = router;