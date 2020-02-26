const express = require('express');
const router = express.Router();
const videoRouter = require('./video');

router.use('/video', videoRouter);
router.use('/thumbnail', express.static('./assets/thumbnail'));

module.exports = router;
