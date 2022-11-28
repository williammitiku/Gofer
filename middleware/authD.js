const jwt = require("jsonwebtoken");

const authD= (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, driver) => {
      if (err) {
        console.log(err)
        return res.status(401).json({ status: "error", message: "authorization error", error: err });
      }
      req.driver  = driver;
      next();
    });
  } else {
    return res.status(401).json({ status: "error", message: "no token found" });
  }
};

module.exports = authD

