const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Model/user');

// Guard against missing JWT secret at startup
if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
}

// Login Controller 
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: true,
            message: "Credentials required.",
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: true,
            message: "Invalid email format",
        });
    }

    try {
        const user = await User.findOne({ email });

        // Unified error message to prevent user enumeration
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                error: true,
                message: "Invalid credentials",
            });
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "72h" }
        );

        return res.json({
            error: false,
            message: "Login successful",
            user: { userName: user.userName, email: user.email },
            accessToken,
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
};

// Register Controller
const register = async (req, res) => {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
        return res.status(400).json({
            error: true,
            message: "All fields are required.",
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: true,
            message: "Invalid email format",
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                error: true,
                message: "User already exists.",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            userName,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        return res.status(201).json({
            error: false,
            message: "User registered successfully",
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
};

module.exports = {
    login,
    register
};