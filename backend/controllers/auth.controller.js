import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import User from "../models/user.model.js"

/**
 * Centralized Cookie Strategy
 * Ensuring 100% attribute parity between Login and Logout to prevent "Zombie Cookies".
 * partitioned: true is required for the Chrome Extension to access the cookie in a cross-site context.
 */
const getCookieOptions = (isLogout = false) => {
    const baseOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        partitioned: true,
    };

    if (isLogout) {
        return {
            ...baseOptions,
            maxAge: 0,
            expires: new Date(0), // Force immediate expiration
        };
    }

    return {
        ...baseOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
    };
};

/**
 * User Registration
 * Validates input, hashes password, and sets a secure JWT cookie.
 */
 export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie("token", token, getCookieOptions());

    res.status(201).json({
      message: "Welcome to MemoryOS!",
      token, // ✅ Return token in body for Extension Sync
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Registration failed. Please try again later." });
  }
};

/**
 * User Login
 * Authenticates user and establishes a secure session cookie.
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.cookie("token", token, getCookieOptions());

        res.status(200).json({
            message: "Successfully logged in",
            token, // ✅ Return token in body for Extension Sync
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Login failed. Please try again later." });
    }
}

/**
 * User Logout
 * Clears the session cookie.
 */
export const logoutUser = async (req, res) => {
    try {
        // Absolute Cookie Clearing Strategy
        // 1. Set Clear-Site-Data header to forcefully purge all origin cookies
        res.setHeader("Clear-Site-Data", '"cookies"');

        // 2. Overwrite with identical attributes + immediate expiry (Max-Age: 0, Expires: 1970)
        res.cookie("token", "", getCookieOptions(true));

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Logout failed" });
    }
};

/**
 * Get Profile
 * Returns currently authenticated user details.
 */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user profile" });
    }
}