import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  try {
    console.log("Inside userAuth middleware", req); // Debugging line
    // Make sure you have cookie-parser in server.js
    // app.use(cookieParser());
    const token = req.cookies.token; // ✅ get the token
    console.log("Token from cookies:", token); // Debugging line
    debbugger;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized1" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Unauthorized2" });
    }

    req.body.userId = decoded.id; // ✅ attach userId to req.body
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized3" });
  }
};

export default userAuth;
