const { STRIPE_SECRET } = require("../env_constants");
const stripe = require("stripe")(STRIPE_SECRET);

async function getSubscription(stripeCustomerId)
{
    const subscription = (await stripe.subscriptions.list({
        customer: stripeCustomerId,
        limit: 1
    })).data[0];

    if (subscription)
        console.log(subscription.status)

    const currentPlan = (subscription && (subscription.status === "active")) ? "premium" : "free";
    return { subscription, currentPlan };
}

module.exports = { stripe, getSubscription };
