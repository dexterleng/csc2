const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../env_constants");
const dynamodb = require("../lib/dynamodb");
const { getSubscription } = require("../lib/stripe");

module.exports = async (req, res, next) => {

    // override users for testing
    if (parseInt(process.env.TESTING))
    {
        const username = "testuser1";

        const user = (await dynamodb.getTableData({
            TableName: "users",
            Key: { username }
        })).Item;
    
        const { currentPlan } = await getSubscription(user.stripeCustomerId);
        res.locals.user = {
            username,
            stripeCustomerId: user.stripeCustomerId,
            type: currentPlan
        };
        return next();
    }

    try {
        const authToken = req.cookies.token;
        res.locals.user = jwt.verify(authToken, JWT_SECRET);
    } catch (error)
    {
        res.clearCookie("token");
    }

    next();
}