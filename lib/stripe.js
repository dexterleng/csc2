const { STRIPE_SECRET } = require("../env_constants");
const stripe = require("stripe")(STRIPE_SECRET);

module.exports = { stripe };
