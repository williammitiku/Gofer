const jwt = require("jsonwebtoken");

const authA= (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
      if (err) {
        console.log(err)
        return res.status(401).json({ status: "error", message: "authorization error", error: err });
      }
      req.admin  = admin;
      next();
    });
  } else {
    return res.status(401).json({ status: "error", message: "no token found" });
  }
};

module.exports = authA

