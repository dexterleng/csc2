const axios = require("axios");

module.exports = {
    hash: {
        async hash(password, rounds)
        {
            const res = await axios({
                method: "post",
                url: `https://sz4c5o9zhi.execute-api.us-east-1.amazonaws.com/deployment/lambda/hash`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    password,
                    rounds
                }
            });
            return res.data.hash;
        },
        async compareHash(password, userHash)
        {
            const res = await axios({
                method: "post",
                // url: `${process.env.BASE_URL}/lambda/hash`,
                url: `${process.env.BASE_URL}/lambda/hash`,
                data: {
                    password,
                    userHash
                }
            });

            return res.data.match;
        }
    }
};
