const express = require('express');
const { DISQUS_SHORTNAME } = require('./env_constants');
const router = express.Router()
const { STRIPE_PUBLIC } = require("./env_constants");

router.use("/login", (req, res) => res.render("login"));

router.use('/', function (req, res, next) {
  res.render('index', { STRIPE_PUBLIC });
})

router.get('/talents/:id', function (req, res, next) {
  let disqusUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  const isDevelopment = process.env.NODE_ENV === null || process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    // To test in development, add localtest.me to the list of 'Trusted Domains' in https://<shortname>.disqus.com/admin/settings/advanced/
    // localtest.me redirects to localhost.
    // localhost doesn't work with disqus.
    disqusUrl = req.protocol + '://' + 'localtest.me' + req.originalUrl;
  }
  res.render('talents/show', {
    talentId: req.params.id,
    disqusShortname: DISQUS_SHORTNAME,
    disqusUrl
  });
})

module.exports = router;