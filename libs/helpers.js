
const Crypto = require('crypto')
const jwt = require("jsonwebtoken");

const helperContainer = {}

helperContainer.verifyToken = function(req, res, next) {
    const bearerHeader = req.headers['authorization']

    if(typeof bearerHeader !== 'undefined') {
        const [ bearer, token ] = bearerHeader.split(' ');
        req.token = token
        next()
    } else {
        res.status(403).json({"Error":"Verfication of token failed."})
    }
}


helperContainer.scanToken = function(req, res, next) {
    jwt.verify(req.token, process.env.jwtSecret, (err, verifiedData) => {
        if (!err) {
            req.user = verifiedData.data;
            next()
        } else {
            res.send({error: 'Invalid Token'})
        }
    });
}


helperContainer.hash = function(passString) {
    if (typeof passString === 'string' && passString.length >= 10) {
        const hash = Crypto.Hmac('sha256', process.env.secretKey).update(passString).digest('hex');
        return hash
    } else {
        return false;
    }
}

helperContainer.getToken = function(req, res, next) {
    const token = req.headers.cookie;
    if (!token) res.send({ error: "Not Logged in" });
    const parsedToken = token.replace("auth=", "");
    req.token = parsedToken;
    next()
}

helperContainer.getUser = function(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.jwtSecret, (err, verifiedData) => {
            if (err) reject(err)
            resolve(verifiedData.data)
        });
    });
}

module.exports = helperContainer;