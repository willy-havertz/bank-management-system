const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if(!token) return res.status(404).json({message: "Access denied"});

    try{
        const verified = jwt.verify(token, proces.env.JWT_SECRET);
        req.customer = verified;
        next();
    }
    catch(err){
        res.status(400).json({message:"Invalid token"});
    }
};