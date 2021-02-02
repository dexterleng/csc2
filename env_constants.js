module.exports = {
  CLARIFAI_KEY: process.env.CLARIFAI_KEY,
  ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
  ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY,
  ALGOLIA_TALENT_INDEX: process.env.ALGOLIA_TALENT_INDEX,
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  STRIPE_SECRET: process.env.STRIPE_SECRET,
  STRIPE_PUBLIC: process.env.STRIPE_PUBLIC,
  STRIPE_PRODUCT_ID: process.env.STRIPE_PRODUCT_ID,
  S3_ACCESS_SECRET: process.env.S3_ACCESS_SECRET,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SESSION_TOKEN: process.env.S3_SESSION_TOKEN,
  S3_REGION: process.env.S3_REGION,
  S3_BUCKET: process.env.S3_BUCKET,

  // To test Disqus in development, add localtest.me to the list of 'Trusted Domains' in https://<shortname>.disqus.com/admin/settings/advanced/
  // localtest.me redirects to localhost.
  // localhost doesn't work with disqus.
  DISQUS_SHORTNAME: process.env.DISQUS_SHORTNAME
}
