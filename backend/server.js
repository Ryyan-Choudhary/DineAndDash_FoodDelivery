require('dotenv').config();  // This should be the very first line
// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = 3001; // You can change the port if needed

// Allow cross-origin requests
app.use(cors());

// Database configuration
const config = {
    user: process.env.DB_USER, // Replace with your DB username
    password: process.env.DB_PASSWORD, // Replace with your DB password
    server: process.env.DB_SERVER, // Replace with your DB server
    database: process.env.DB_DATABASE, // Replace with your DB name
    options: {
        encrypt: true, // Use encryption if required
        trustServerCertificate: true, // Use this if you're not using a trusted certificate
    },
};

// Route to fetch table names
app.get('/api/tables', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT name AS TableName
            FROM sys.tables
            ORDER BY name
        `);

        res.json(result.recordset); // Send the table names as JSON
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({
            message: 'Error fetching table names',
            error: error.message,
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
