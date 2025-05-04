const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get menu items for a specific restaurant
router.get('/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
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
        
        const result = await pool.request()
            .input('restaurantId', sql.Int, restaurantId)
            .query('SELECT * FROM DineAndDash_MenuItems WHERE restaurant_id = @restaurantId');
            
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
