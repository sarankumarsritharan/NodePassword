const bcryptjs = require('bcryptjs');
const { response } = require('express');
const JWT = require('jsonwebtoken');
const secret = "supersecret"


const hashing = async(value) => {
    try {
        const salt = await bcryptjs.genSalt(10);
        console.log("salt", salt)
        const hash = await bcryptjs.hash(value, salt); //Refer Doc  value should in double quotes
        console.log("hash", hash)
        return hash
    } catch (error) {
        return error

    }
};

const hashCompare = async(password, hashvalue) => {
    try {
        return await bcryptjs.compare(password, hashvalue);
    } catch (error) {
        return error;
    }
};

const createJWT = async({ email, _id }) => {
    try {
        return await JWT.sign({ email, _id }), secret, { expiresIn: "1h" }

    } catch (error) {
        return error;
    }
}

const authorize = async(req, res, next) => {
    try {
        //check if the token is present
        const bearerToken = await req.headers.authorization;
        if (bearerToken) {
            //check if the token is valid
            JWT.verify(bearerToken, secret, (error, decode) => {
                    if (error) {
                        return res.sendStatus(403);
                    } else {
                        // res.json(decode)
                        // console.log(decode)
                        // if (decode !== undefined) {
                        //     const auth = decode;
                        //     req.body.auth = auth;
                        // }
                        // if valid allow the user
                        console.log("Allow user")
                        next();
                    }
                })
                // console.log("Allow user")
                // next();
        } else {
            console.log("No token available")
            return res.sendStatus(403)
        }
    } catch (error) {}

};


module.exports = { hashing, hashCompare, createJWT, authorize }