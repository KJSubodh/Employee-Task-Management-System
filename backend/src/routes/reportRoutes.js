const express = require('express');
const { protect } = require('../middlewares/auth');
const { generateReport } = require('../controllers/reportController');

const router = express.Router();

router.use(protect);
router.get('/', generateReport);

module.exports = router;