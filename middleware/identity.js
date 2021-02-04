const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../env_constants");

module.exports = (req, res, next) => {
    try {
        const authToken = req.cookies.token;
        res.locals.user = jwt.verify(authToken, JWT_SECRET);
    } catch (error)
    {
        res.clearCookie("token");
    }

    next();
}