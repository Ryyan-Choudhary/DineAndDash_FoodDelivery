const express = require('express');
const router = express.Router();
const sql = require('mssql');
const restaurantController = require('../controllers/restaurantController');

// Database configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

// Get all restaurants
router.get('/', async (req, res) => {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT restaurant_id as id, name, location, cuisine_type, image_url FROM DineAndDash_Restaurants ORDER BY name');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    } finally {
        if (pool) {
            try {
                await pool.close();
            } catch (err) {
                console.error('Error closing pool:', err);
            }
        }
    }
});

// Add new restaurant
router.post('/', async (req, res) => {
    let pool;
    try {
        const { name, location, cuisine_type, image_url, owner_id } = req.body;

        // Validate required fields
        if (!name || !location || !cuisine_type || !owner_id) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Name, location, cuisine type, and owner ID are required'
            });
        }

        pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('name', sql.VarChar(100), name)
            .input('location', sql.VarChar(255), location)
            .input('cuisine_type', sql.VarChar(50), cuisine_type)
            .input('image_url', sql.VarChar(255), image_url || null)
            .input('owner_id', sql.Int, owner_id)
            .query(`
                INSERT INTO DineAndDash_Restaurants (name, location, cuisine_type, image_url, owner_id)
                OUTPUT INSERTED.restaurant_id, INSERTED.name, INSERTED.location, INSERTED.cuisine_type, INSERTED.image_url
                VALUES (@name, @location, @cuisine_type, @image_url, @owner_id)
            `);

        res.status(201).json({
            message: 'Restaurant added successfully',
            restaurant: result.recordset[0]
        });
    } catch (err) {
        console.error('Error adding restaurant:', err);
        res.status(500).json({ 
            error: 'Failed to add restaurant', 
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    } finally {
        if (pool) {
            try {
                await pool.close();
            } catch (err) {
                console.error('Error closing pool:', err);
            }
        }
    }
});

// Get restaurants by owner ID
router.get('/owner/:ownerId', async (req, res) => {
    let pool;
    try {
        const { ownerId } = req.params;
        console.log('Fetching restaurants for owner ID:', ownerId); // Debug log

        pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('ownerId', sql.Int, ownerId)
            .query(`
                SELECT 
                    r.restaurant_id,
                    r.name,
                    r.location,
                    r.cuisine_type,
                    r.image_url,
                    ISNULL((SELECT COUNT(*) FROM DineAndDash_Orders WHERE restaurant_id = r.restaurant_id), 0) as total_orders
                FROM DineAndDash_Restaurants r
                WHERE r.owner_id = @ownerId
                ORDER BY r.name
            `);
        
        console.log('Query result:', result.recordset); // Debug log
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching owner restaurants:', err);
        res.status(500).json({ 
            error: 'Failed to fetch restaurants', 
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    } finally {
        if (pool) {
            try {
                await pool.close();
            } catch (err) {
                console.error('Error closing pool:', err);
            }
        }
    }
});

// Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// Update restaurant
router.put('/:id', restaurantController.updateRestaurant);

// Delete restaurant
router.delete('/:id', restaurantController.deleteRestaurant);

module.exports = router; 