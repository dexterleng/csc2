const express = require('express')
const router = express.Router()

router.use('/', function (req, res, next) {
  res.render('index', {foo: 'FOO'});
})

module.exports = router;