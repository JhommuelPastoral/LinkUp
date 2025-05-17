import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if(!token) {
      return res.status(401).json({message: "Unauthorized"});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded) {
      return res.status(401).json({message: "Token not Unauthorized"});
    }
    const existUser = await User.findById(decoded.userId).select("-password");
    if(!existUser) {
      return res.status(401).json({message: "Unauthorized"});
    }
    req.user = existUser;
    next();

  } catch (error) {
    console.log("protectedRoute", error.message); 
    return res.status(401).json({sucess: false, message: "Not authorized"});

  }

};


export default protectedRoute;  