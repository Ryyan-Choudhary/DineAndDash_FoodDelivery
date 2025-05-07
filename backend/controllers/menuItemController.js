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

// Create a new menu item
exports.createMenuItem = async (req, res) => {
    try {
        const { name, price, description, image_url, restaurant_id } = req.body;
        
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('restaurant_id', sql.Int, restaurant_id)
            .input('name', sql.VarChar(100), name)
            .input('price', sql.Decimal(10, 2), price)
            .input('description', sql.VarChar(500), description)
            .input('image_url', sql.VarChar(255), image_url)
            .query(`
                INSERT INTO DineAndDash_MenuItems (restaurant_id, name, price, description, image_url)
                VALUES (@restaurant_id, @name, @price, @description, @image_url);
                SELECT SCOPE_IDENTITY() AS item_id;
            `);

        const newItem = {
            item_id: result.recordset[0].item_id,
            restaurant_id,
            name,
            price,
            description,
            image_url
        };

        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get all menu items for a restaurant
exports.getMenuItems = async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('restaurant_id', sql.Int, req.params.restaurantId)
            .query(`
                SELECT * FROM DineAndDash_MenuItems 
                WHERE restaurant_id = @restaurant_id
                ORDER BY name
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update a menu item
exports.updateMenuItem = async (req, res) => {
    try {
        const { name, price, description, image_url } = req.body;
        
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('item_id', sql.Int, req.params.id)
            .input('name', sql.VarChar(100), name)
            .input('price', sql.Decimal(10, 2), price)
            .input('description', sql.VarChar(500), description)
            .input('image_url', sql.VarChar(255), image_url)
            .query(`
                UPDATE DineAndDash_MenuItems 
                SET name = @name,
                    price = @price,
                    description = @description,
                    image_url = @image_url
                WHERE item_id = @item_id;
                
                SELECT * FROM DineAndDash_MenuItems WHERE item_id = @item_id;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
    try {
        console.log('Attempting to delete menu item with ID:', req.params.id);
        
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('item_id', sql.Int, req.params.id)
            .query(`
                DELETE FROM DineAndDash_MenuItems 
                WHERE item_id = @item_id;
                
                SELECT @@ROWCOUNT as deleted;
            `);

        console.log('Delete query result:', result.recordset[0]);

        if (result.recordset[0].deleted === 0) {
            console.log('No menu item found with ID:', req.params.id);
            return res.status(404).json({ 
                message: 'Menu item not found',
                itemId: req.params.id 
            });
        }

        console.log('Menu item successfully deleted');
        res.json({ 
            message: 'Menu item deleted successfully',
            itemId: req.params.id
        });
    } catch (error) {
        console.error('Error in deleteMenuItem:', error);
        res.status(500).json({ 
            message: 'Error deleting menu item',
            error: error.message
        });
    }
}; 