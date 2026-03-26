import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  let token = req.cookies.token;

  // Fallback to Authorization Header (Bearer token) for Extension requests
  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Auth] Path: ${req.path}, Token present: ${!!token}, Method: ${req.headers.authorization ? "Header" : "Cookie"}`);
  }

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.id;   

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Invalid or expired token"
    });

  }

};

export default protect;