const express = require('express')
const router = express.Router()

router.use('/healthcheck', function (req, res, next) {
  res.status(200).send('API Healthy');
})

module.exports = router;