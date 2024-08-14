const jwt = require("jsonwebtoken")

const authToken = async (req, res, next) => {
    try
    {
        const token = req.headers.token || req.cookies.token
        const user = await jwt.verify(token,process.env.JWT_SECRET) 

        if(!user) throw "err"

        req.user = user
        next()
    }
    catch(err)
    {
        res.clearCookie("token")

        return res.json({status : false, error : "Missing/Invalid token"})
    }
}

module.exports = authToken