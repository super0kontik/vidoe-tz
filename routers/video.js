const express = require('express');
const router = express.Router();
const { getList, getVideo } = require('../controllers/video');

router.get('/', getList);
router.get('/:video', getVideo);

module.exports = router;
