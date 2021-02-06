const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../env_constants");

module.exports = (req, res, next) => {

    // res.locals.user = {
    //     username: "testuser1",
    //     stripeCustomerId: "cus_Is5uFEpKQjzGZ0",
    //     type: "premium"
    // };
    // return next();

    try {
        const authToken = req.cookies.token;
        res.locals.user = jwt.verify(authToken, JWT_SECRET);
    } catch (error)
    {
        res.clearCookie("token");
    }

    next();
}