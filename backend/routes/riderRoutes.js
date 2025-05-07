const express = require('express');
const router = express.Router();
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

// Get all free orders (orders with rider_id as NULL)
router.get('/freeOrders', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(`
                SELECT order_id, total_amount, delivery_address, status, order_time
                FROM DineAndDash_Orders
                WHERE rider_id IS NULL AND status != 'Delivered' AND status != 'Cancelled'
                ORDER BY order_time DESC
            `);
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching free orders:', err);
        res.status(500).json({ error: 'Failed to fetch free orders' });
    }
});

// Update order when rider picks it up
router.put('/pickup-order/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { riderId } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .input('riderId', sql.Int, riderId)
            .query(`
                UPDATE DineAndDash_Orders
                SET rider_id = @riderId,
                    status = 'Picked Up'
                WHERE order_id = @orderId AND rider_id IS NULL
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(400).json({ error: 'Order not available or already picked up' });
        }

        res.json({ message: 'Order picked up successfully' });
    } catch (err) {
        console.error('Error picking up order:', err);
        res.status(500).json({ error: 'Failed to pick up order' });
    }
});

// Update order status
router.put('/update-order-status/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Placed', 'Preparing', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .input('status', sql.VarChar, status)
            .query(`
                UPDATE DineAndDash_Orders
                SET status = @status
                WHERE order_id = @orderId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order status updated successfully' });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

module.exports = router; 