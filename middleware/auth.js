const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { JWT_SECRET } = require("../env_constants");

function auth({ deferHandle = false } = {})
{
    const router = express.Router();
    
    router.use(cookieParser());
    
    router.use(async (req, res, next) => {
        const authToken = req.cookies.token;
    
        try
        {
            res.locals.user = jwt.verify(authToken, JWT_SECRET);
        }
        catch (error)
        {
            res.clearCookie("token");
            if (!deferHandle)
                return res.status(403).send();
        }
        next();
    });

    return router;
}

module.exports = auth;
