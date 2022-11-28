const jwt = require("jsonwebtoken");

const authRefresh = (req, res, next) => {
  const {refreshToken} = req.body;
  if (refreshToken) {
    
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log(err)
        return res.status(401).json({ status: "error", message: "authorization error", error: err });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ status: "error", message: "no token found" });
  }
};

module.exports = authRefresh

