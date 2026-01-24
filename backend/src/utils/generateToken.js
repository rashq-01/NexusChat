require("dotenv").config();
const jwt = require("jsonwebtoken");

const token = (payload)=>{
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn : process.env.JWT_EXPIRES_IN
        }
    );
};

module.exports = token;