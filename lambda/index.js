const bcrypt = require("bcrypt");

// hash when only password provided
// return match if userHash (actual hash to check against) is provided
exports.handler = async (event, context, callback) => {
    const { password, userHash, rounds } = event;

    if (userHash)
    {
        const passwordMatches = await bcrypt.compare(password, userHash);
        return callback(null, {
            statusCode: 200,
            match: passwordMatches
        });
    }
    else
    {
        const passwordHash = await bcrypt.hash(password, rounds);
        return callback(null, {
            statusCode: 200,
            hash: passwordHash
        });
    }
    
};
