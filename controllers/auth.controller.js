const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendWelcomeEmail } = require("../config/mailer");

const signToken = (user) => {
    return jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

exports.register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
        res.status(409);
        throw new Error("Email already in use");
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashed,
    });

    sendWelcomeEmail(user.email, user.username).catch((e) => {
        console.error("Welcome email failed:", e.message);
    });

    res.status(201).json({
        message: "User created",
        user: {
        id: user._id,
        username: user.username,
        email: user.email,
        },
    });
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const valid = user && (await bcrypt.compare(password, user.password));

    if (!valid) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    const token = signToken(user);

    res.json({
        token,
        user: {
        id: user._id,
        username: user.username,
        role: user.role,
        },
    });
});

exports.getInfo = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.json(user);
});
