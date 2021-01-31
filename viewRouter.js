const express = require('express')
const router = express.Router()

router.get('/', function (req, res, next) {
  res.render('index');
})

router.get('/talents/:id', function (req, res, next) {
  res.render('talent', { talentId: req.params.id });
})

module.exports = router;