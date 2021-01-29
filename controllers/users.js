const express = require("express");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const config = require("../config");
const { JWT_SECRET } = require("../env_constants");

const router = express.Router();

router.use(express.json());

// register
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    
    // check password strength
    try
    {
        // salt is held within hash format
        const hash = await bcrypt.hash(password, config.bcrypt.saltRounds);

        // store username and hash in dynamodb table

        res.send(hash);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("An error occurred while processing your request");
    }
});

// login
router.post("/", async (req ,res) => {
    const { username, password } = req.body;

    try
    {
        // get user record with hash from table

        const passwordMatches = await bcrypt.compare(password, "$2b$10$FN1l.0f0uPUA8cmuoYHZ4ukK1ndP1/4rlw2mtZyqyh6tEy.UDeorK");
        if (!passwordMatches)
            return res.status(403).send();

        
        // replace with subscription type
        const token = jwt.sign({ id: username, type: "basic" }, JWT_SECRET, config.jwt);
        
        res.cookie("token", token, { expires: new Date(Date.now() + config.jwt.expiresIn * 1000) }).send();
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("An error occurred while processing your request");
    }
    
});

module.exports = router;