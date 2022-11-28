const jwt = require("jsonwebtoken");

const authM= (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, biker) => {
      if (err) {
        console.log(err)
        return res.status(401).json({ status: "error", message: "authorization error", error: err });
      }
      req.biker  = biker;
      next();
    });
  } else {
    return res.status(401).json({ status: "error", message: "no token found" });
  }
};

module.exports = authM

