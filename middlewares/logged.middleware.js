const jwt = require("jsonwebtoken");

const logged = async (req, res, next) => {
  try {
    const token = req.headers.token || req.cookies.token;
    const user = await jwt.verify(token, process.env.JWT_SECRET);

    if (!user) {
      req.islogged = false;
    } else {
      req.islogged = true;
    }
  } catch (err) {
    req.islogged = false;
  }

  next();
};

module.exports = logged;
