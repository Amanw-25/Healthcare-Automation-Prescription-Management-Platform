import jwt from "jsonwebtoken";
import appconfig from "../config/appConfig.js";
import { User } from "../models/index.js";

export const authenticate = async (req, res, next) => {
    const authToken = req.headers.authorization;

    if (!authToken || !authToken.startsWith("Bearer")) {
        return res.status(401).json({
            message: "No Token, Authorization Denied",
        });
    }

    try {
        const token = authToken.split(" ")[1];

        const decoded = jwt.verify(token, appconfig.JWT_SECRET);

        req.userId = decoded.id;
        req.role = decoded.role;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token Expired",
            });
        }

        return res.status(401).json({
            message: "Token is not valid",
        });
    }
};

export const restrict = (roles) => async (req, res, next) => {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!roles.includes(user.role)) {
        return res
            .status(401)
            .json({ success: false, message: "You're not authorized" });
    }

    next();
};
