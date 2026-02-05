import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const signup = async (req, res) => {
    const { name, email, password } = req.body; // Added '='

    try {
        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create the user
        await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });

        // 4. Send success response
        return res.status(201).json({ message: "Account Created" });

    } catch (err) {
        
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!existingUser) {
            console.error("Login error: User not found for email:", email);
            return res.status(404).json({ message: "User not found" });
        }

        // Use bcrypt correctly
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            console.error("Login error: Invalid credentials for email:", email);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Ensure JWT_SECRET matches your .env file exactly (usually uppercase)
        if (!process.env.JWT_SECRET) {
            console.error("Login error: JWT_SECRET is not defined in environment variables.");
            return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET missing" });
        }
        const token = jwt.sign(
            { id: existingUser.id },
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        return res.status(200).json({ 
            token, 
            user: { id: existingUser.id, name: existingUser.name, email: existingUser.email },
            message: "Login successful" 
        });

    } catch (error) {
        console.error("Login error (exception):", error, "Request body:", req.body);
        return res.status(500).json({ message: "Internal server error" });
    }
};