const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { JWT_SECRET } = require("../env_constants");

const router = express.Router();

router.use(cookieParser());

router.use((req, res, next) => {
    const authToken = req.cookies.token;

    try
    {
        res.locals.user = jwt.verify(authToken, JWT_SECRET);
        next();
    }
    catch (error)
    {
        res.status(403).send();
    }
});

module.exports = router
