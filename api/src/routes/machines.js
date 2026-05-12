const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/machines');

// ── Layer 3: Partner / Msa3ed APIs ───────────────────────────
router.get('/nearby',             controller.getNearby);

// ── Layer 2: Machine APIs ─────────────────────────────────────
router.post('/register',          controller.register);
router.post('/:id/heartbeat',     controller.heartbeat);
router.put('/:id/status',         controller.updateStatus);
router.post('/:id/stock',         controller.updateStock);
router.post('/:id/fault',         controller.reportFault);
router.post('/:id/verify-code',   controller.verifyCode);
router.get('/:id/orders/pending', controller.getPendingOrder);
router.get('/:id/content',        controller.getContent);

// ── Layer 3: Partner / Msa3ed APIs ───────────────────────────
router.get('/:id/menu',           controller.getMenu);
router.get('/:id/suppliers',      controller.getSuppliers);
router.get('/:id',                controller.getOne);

module.exports = router;
