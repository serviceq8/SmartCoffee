const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/admin');

router.get('/machines',          controller.getAllMachines);
router.get('/machines/:id',      controller.getMachine);
router.post('/machines',         controller.createMachine);
router.put('/machines/:id',      controller.updateMachine);
router.get('/orders',            controller.getAllOrders);
router.get('/branches',          controller.getAllBranches);
router.get('/faults',            controller.getAllFaults);
router.put('/faults/:id/resolve',controller.resolveFault);

module.exports = router;
