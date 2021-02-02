const express = require("express");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dynamodb = require("../lib/dynamodb");
const { stripe, getSubscription } = require("../lib/stripe");
const useragent = require('express-useragent');

const config = require("../config");
const { JWT_SECRET, STRIPE_PRODUCT_ID } = require("../env_constants");

const router = express.Router();

router.use(express.json());

// register
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    
    if (password.length < 8)
        return res.status(400).send("Password should have at least 8 characters");

    try
    {
        const user = (await dynamodb.getTableData({
            TableName: "users",
            Key: { username }
        })).Item;

        if (user)
            res.status(403).send("User already exists");

        // salt is held within hash format
        const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);
        
        const stripeCustomer = await stripe.customers.create({
            metadata: { username }
        });

        await dynamodb.createTableData({
            TableName: "users",
            Item: {
                username,
                passwordHash,
                stripeCustomerId: stripeCustomer.id
            }
        });

        res.status(204).send();
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("An error occurred while processing your request");
    }
});

// login
router.post("/login", useragent.express(), async (req ,res) => {
    const { username, password } = req.body;

    try
    {
        const user = (await dynamodb.getTableData({
            TableName: "users",
            Key: { username }
        })).Item;
        
        if (!user)
            return res.status(403).send("Invalid username or password");
            
        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches)
            return res.status(403).send("Invalid username or password");

        // add current session data
        await dynamodb.createTableData({
            TableName: "userSessions",
            Item: {
                username,
                timestamp: new Date(Date.now()).toISOString(),
                ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                agent: JSON.stringify(req.useragent.source)
            }
        });

        const { subscription, currentPlan } = await getSubscription(user.stripeCustomerId);

        const token = jwt.sign({
            username,
            stripeCustomerId: user.stripeCustomerId,
            type: currentPlan
        }, JWT_SECRET, config.jwt);
        
        res.clearCookie("token");
        res.cookie("token", token, { expires: new Date(Date.now() + config.jwt.expiresIn * 1000), overwrite: true }).send();
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("An error occurred while processing your request");
    }
    
});

router.get("/subscription", auth(), async (req, res) => {
    res.clearCookie("token");
    
    const user = res.locals.user;
    
    const { currentPlan } = await getSubscription(user.stripeCustomerId);
    
    const token = jwt.sign({
        ...res.locals.user,
        type: currentPlan
    }, JWT_SECRET, { mutatePayload: true });

    res.cookie("token", token, { expires: new Date(user.exp * 1000) }).send();
})

router.get("/checkout", auth(), async (req, res) => {
    const host = `http://${req.get("Host")}`;
    const user = res.locals.user;

    try
    {
        const session = await stripe.checkout.sessions.create({
            customer: user.stripeCustomerId,
            success_url: host,
            cancel_url: host,
            payment_method_types: ["card"],
            line_items: [{ price: STRIPE_PRODUCT_ID, quantity: 1 }],
            mode: "subscription"
        });
    
        res.send(session);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("An error occurred while processing your request");
    }
})

router.get("/manage", auth(), async (req, res) => {
    const host = `http://${req.get("Host")}`;
    const user = res.locals.user;

    try
    {
        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: host,
        });
    
        res.redirect(session.url);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("An error occurred while processing your request");
    }
});

router.get("/history", auth(), async (req, res) => {
    const user = res.locals.user;

    try
    {
        const loginHistory = (await dynamodb.queryTableData({
            TableName: "userSessions",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: { ":username": user.username }
        })).Items

        res.send(loginHistory);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("An error occurred while processing your request");
    }

});

module.exports = router;