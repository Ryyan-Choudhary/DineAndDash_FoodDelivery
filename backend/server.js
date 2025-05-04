require('dotenv').config();  // This should be the very first line
// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const menuRoutes = require('./routes/menu');

const app = express();
const port = 3001; // You can change the port if needed

// Allow cross-origin requests
app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

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

// Menu routes
app.use('/api/menu', menuRoutes);

// Root route redirects to menu page
app.get('/', (req, res) => {
    res.redirect('/menu');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
