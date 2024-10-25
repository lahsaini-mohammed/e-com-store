import User from "../models/user.model.js";
import {redis} from "../lib/redis.js";

import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

const storeRefreshToken = async (refreshToken, userId) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "ex", 604800); // 7 days
};

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("access_token", accessToken, {
        httpOnly: true, // prevents XSS (cross site scripting) attacks
        secure: process.env.NODE_ENV === "production", // only set cookies over HTTPS when in production
        sameSite: "strict", //  prevents cross-site request forgery (CSRF) attacks
        maxAge: 15*60*1000 //  15 minutes in milliseconds
    });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 604800*1000 // 7 days in milliseconds
    
    });
};

export const signup = async (req, res) => {
	const { email, password, name } = req.body;

    try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(409).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email, password });

        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(refreshToken, user._id);
        setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		});
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user._id);
            await storeRefreshToken(refreshToken, user._id);
            setCookies(res, accessToken, refreshToken);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (refreshToken) {
            const userId = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET).userId;
            await redis.del(`refresh_token:${userId}`);
        }
        // }else {
        //     return res.json({ message: "No refresh token provided" });
        // }
    
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: error.message });
    }
};
//  recreate access token using the refresh token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }
        const userId = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET).userId;
        const storedRefreshToken = await redis.get(`refresh_token:${userId}`);
        
        if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15*60*1000 // 15 minutes in milliseconds
        });

        res.json({ message: "Access token refreshed successfully" });
    } catch (error) {
        console.log("Error in refreshToken controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Error in getProfile controller", error.message);
        res.status(500).json({ message: error.message });
    }
};