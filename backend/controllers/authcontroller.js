// controllers/authController.js
const sql = require('mssql');
require('dotenv').config();

// Signup controller
const signup = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Connect to database
        const pool = await sql.connect({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        });

        // Check if user already exists
        const userCheck = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM DineAndDash_Users WHERE email = @email');

        if (userCheck.recordset.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Insert new user
        const result = await pool.request()
            .input('name', sql.VarChar, name)
            .input('email', sql.VarChar, email)
            .input('phone', sql.VarChar, phone)
            .input('password', sql.VarChar, password)
            .input('role', sql.VarChar, role)
            .query(`
                INSERT INTO DineAndDash_Users (name, email, phone, password, role)
                VALUES (@name, @email, @phone, @password, @role);
                SELECT SCOPE_IDENTITY() AS user_id;
            `);

        const userId = result.recordset[0].user_id;

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: userId,
                name,
                email,
                role
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login controller
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Connect to database
        const pool = await sql.connect({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        });

        // Find user
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .query('SELECT * FROM DineAndDash_Users WHERE email = @email AND password = @password');

        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the role matches
        if (user.role.toLowerCase() !== role.toLowerCase()) {
            return res.status(403).json({ 
                message: `Invalid role. This account is registered as a ${user.role}. Please select the correct role.` 
            });
        }

        res.json({
            message: 'Login successful',
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    signup,
    login
};
