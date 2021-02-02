const express = require('express');
const { DISQUS_SHORTNAME, STRIPE_PUBLIC } = require('./env_constants');
const auth = require("./middleware/auth");
const router = express.Router()

const authHandler = shouldFindSession => (req, res, next) => {
  if (!res.locals.user === shouldFindSession)
    return res.redirect("/");
  next();
};

router.use(auth({ deferHandle: true }));

router.use("/login", authHandler(false), (req, res) => res.render("login", { user: res.locals.user }));

router.use("/account", authHandler(true), (req, res) => res.render("account", { STRIPE_PUBLIC, user: res.locals.user }));

router.use('/', function (req, res, next) {
  res.render('index', { user: res.locals.user });
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
    disqusUrl,
    user: res.locals.user
  });
})

module.exports = router;