
const Crypto = require('crypto')

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


helperContainer.hash = function(passString) {
    if (typeof passString === 'string' && passString.length >= 10) {
        const hash = Crypto.Hmac('sha256', process.env.secretKey).update(passString).digest('hex');
        return hash
    } else {
        return false;
    }
}

helperContainer.getToken = function(req, res, next) {
    const token = req.cookies.auth;
    if (token) {
        console.log(token)
    }
    next()
}

// helperContainer.setToken = function(req, res, next) {

// }

module.exports = helperContainer;