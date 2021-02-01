const express = require('express')
const router = express.Router()
const { STRIPE_PUBLIC } = require("./env_constants");

router.use("/login", (req, res) => res.render("login"));

router.use('/', function (req, res, next) {
  res.render('index', { STRIPE_PUBLIC });
})

module.exports = router;