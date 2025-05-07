const sql = require('mssql');
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('restaurant_id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    restaurant_id,
                    name,
                    location,
                    cuisine_type,
                    image_url,
                    owner_id
                FROM DineAndDash_Restaurants 
                WHERE restaurant_id = @restaurant_id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({ message: error.message });
    } finally {
        if (pool) {
            try {
                await pool.close();
            } catch (err) {
                console.error('Error closing pool:', err);
            }
        }
    }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
    let pool;
    try {
        const { name, location, cuisine_type, image_url } = req.body;
        
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('restaurant_id', sql.Int, req.params.id)
            .input('name', sql.VarChar(100), name)
            .input('location', sql.VarChar(255), location)
            .input('cuisine_type', sql.VarChar(50), cuisine_type)
            .input('image_url', sql.VarChar(255), image_url)
            .query(`
                UPDATE DineAndDash_Restaurants 
                SET name = @name,
                    location = @location,
                    cuisine_type = @cuisine_type,
                    image_url = @image_url
                WHERE restaurant_id = @restaurant_id;
                
                SELECT 
                    restaurant_id,
                    name,
                    location,
                    cuisine_type,
                    image_url,
                    owner_id
                FROM DineAndDash_Restaurants 
                WHERE restaurant_id = @restaurant_id;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(400).json({ message: error.message });
    } finally {
        if (pool) {
            try {
                await pool.close();
            } catch (err) {
                console.error('Error closing pool:', err);
            }
        }
    }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('restaurant_id', sql.Int, req.params.id)
            .query(`
                DELETE FROM DineAndDash_Restaurants 
                WHERE restaurant_id = @restaurant_id;
                
                SELECT @@ROWCOUNT as deleted;
            `);

        if (result.recordset[0].deleted === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).json({ 
            message: 'Error deleting restaurant',
            error: error.message 
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
}; 