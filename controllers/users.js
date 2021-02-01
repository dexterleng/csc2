const express = require("express");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dynamodb = require("../lib/dynamodb");
const { stripe } = require("../lib/stripe");

const config = require("../config");
const { JWT_SECRET, STRIPE_PRODUCT_ID } = require("../env_constants");

const router = express.Router();

// const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

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
router.post("/login", async (req ,res) => {
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

        const subscription = (await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            limit: 1
        })).data[0];

        if (subscription)
            console.log(subscription.status)

        const currentPlan = (subscription && (subscription.status === "active")) ? "premium" : "free";

        const token = jwt.sign({
            username,
            stripeCustomerId: user.stripeCustomerId,
            type: currentPlan
        }, JWT_SECRET, config.jwt);
        
        res.cookie("token", token, { expires: new Date(Date.now() + config.jwt.expiresIn * 1000) }).send();
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("An error occurred while processing your request");
    }
    
});

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
});

module.exports = router;