import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.access_token;
        if (!accessToken) {
            return res.status(401).json({ message: "No access token provided" });
        }
        try {
            const userId = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET).userId;
            const user = await User.findById(userId).select("-password");
            if (!user) {
                return res.status(401).json({ message: "Invalid access token, user not found " });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Access token expired, please login again" });
            }else if (error.name === "JsonWebTokenError") {
                return res.status(401).json({ message: "Invalid access token" });
            } else if (error.name === "NotBeforeError") {
                return res.status(401).json({ message: "Access token not yet valid, please login again" });
            } else {
                throw error;
            }
        }     
    } catch (error) {
        console.log("Error in protect route middleware", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const adminRoute = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized, you are not an admin" });
        }
        next();
    } catch (error) {
        console.log("Error in admin route middleware", error.message);
        res.status(500).json({ message: "Server error" });
    }
};