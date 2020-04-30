const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    //GET Token from header

    const token = req.header('x-auth-token');

    // Check if token available

    if (!token) {
        return res
            .status(401)
            .json({ message: 'Provide a token. Authorization Denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ Message: error.message });
    }
};
