const express = require('express');
const { DISQUS_SHORTNAME, STRIPE_PUBLIC } = require('./env_constants');
const router = express.Router()

const authHandler = shouldFindSession => (req, res, next) => {
  if (!res.locals.user === shouldFindSession)
    return res.redirect(`${process.env.BASE_URL}/login?error=You must be signed in to access this resource.`);
  next();
};

const injectGlobal = (req, res, next) => {
  res.locals.env = process.env;
  next();
};

router.use(injectGlobal);

router.get("/login", authHandler(false), (req, res) => res.render("login"));

router.get("/account", authHandler(true), (req, res) => res.render("account"));

router.get('/home', function (req, res, next) {
  res.render('index', { user: res.locals.user });
})

router.get('/talents/create', authHandler(true), function(req, res, next) {
  res.render('talents/create');
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
    user: res.locals.user,
  });
})

router.get('/talents/:id/edit', function(req, res, next) {
  res.render('talents/edit', {
    talentId: req.params.id,
  });
})

module.exports = router;