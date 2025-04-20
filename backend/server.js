const express = require('express');
const sql = require('mssql');
const cors = require('cors');

// Set up the express app
const app = express();
const port = 1443;

// Allow cross-origin requests
app.use(cors());

// Define database connection configuration
const config = {
    user: 'sa',  // Replace with your DB username
    password: 'rollcorner1214',  // Replace with your DB password
    server: 'localhost',  // Replace with your DB server
    database: 'DineAndDash',  // Replace with your DB name
    options: {
        encrypt: true,  // Use encryption if required
        trustServerCertificate: true,  // Use this if you're not using a trusted certificate
    },
};

// Route to fetch schema
app.get('/api/schema', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
      SELECT t.name AS TableName, c.name AS ColumnName
      FROM sys.tables AS t
      INNER JOIN sys.columns AS c ON t.object_id = c.object_id
      ORDER BY t.name, c.column_id
    `);

        // Log the result to ensure you're getting data back from the DB
        console.log('Schema Data:', result.recordset);

        res.json(result.recordset); // Send the data as JSON response
    } catch (error) {
        console.error('Error fetching schema:', error);
        res.status(500).json({
            message: 'Error fetching schema',
            error: error.message,
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
