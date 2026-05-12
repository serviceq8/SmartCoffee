const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/orders');

router.post('/',             controller.create);
router.get('/:id/status',    controller.getStatus);
router.put('/:id/status',    controller.updateStatus);
router.post('/:id/complete', controller.complete);
router.post('/:id/error',    controller.reportError);
router.delete('/:id',        controller.cancel);

module.exports = router;
