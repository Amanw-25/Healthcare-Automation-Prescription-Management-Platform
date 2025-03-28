import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../models/index.js";
import appconfig from "../../config/appConfig.js";
import { redisClient } from "../../config/redisClient.js";

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        appconfig.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

export const register = async (req, res) => {
    const { name, email, password, role, specialization } = req.body;

    try {
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (role !== "doctor" && specialization) {
            return res.status(400).json({ message: "Only doctors can have a specialization" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            specialization: role === "doctor" ? specialization : undefined,
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const blockedKey = `blocked:${email}`;
        const isBlocked = await redisClient.get(blockedKey);
        if (isBlocked) {
            return res.status(403).json({
                message: "Account temporarily blocked. Try again later."
            });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const failedAttemptsKey = `failed:${email}`;
            const failedAttempts = await redisClient.incr(failedAttemptsKey);
            await redisClient.expire(failedAttemptsKey, 900); // Set expiry to 15 minutes

            if (failedAttempts >= 5) {
                await redisClient.setEx(
                    blockedKey,
                    3600, // Block for 1 hour
                    JSON.stringify({
                        reason: 'Too many failed login attempts',
                        blockedUntil: new Date(Date.now() + 3600000).toISOString()
                    })
                );
                return res.status(403).json({
                    message: "Too many failed attempts. Account blocked for 1 hour."
                });
            }

            return res.status(400).json({ message: "Invalid credentials" });
        }

        const successLoginKey = `success:${email}`;
        let successAttempts = await redisClient.get(successLoginKey);

        if (successAttempts) {
            successAttempts = parseInt(successAttempts);
        } else {
            successAttempts = 0;
        }

        if (successAttempts >= 5) {
            await redisClient.setEx(
                blockedKey,
                18000, // Block for 5 hours
                JSON.stringify({
                    reason: 'Potential login spam',
                    blockedUntil: new Date(Date.now() + 18000000).toISOString()
                })
            );
            return res.status(403).json({
                message: "Suspicious activity detected. Account blocked for 5 hours."
            });
        }

        await redisClient.incr(successLoginKey);
        await redisClient.expire(successLoginKey, 600);

        await redisClient.del(`failed:${email}`);

        const token = generateToken(user);
        await redisClient.set(`token:${user._id}`, token, { EX: 30 * 24 * 60 * 60 });

        res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialization: user.specialization || null,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    const userId = req.user.id;

    try {
        await redisClient.del(`token:${userId}`);
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
