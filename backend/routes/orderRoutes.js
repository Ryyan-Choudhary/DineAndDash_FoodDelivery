const express = require('express');
const router = express.Router();
const sql = require('mssql');
require('dotenv').config();

// Database configuration
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

// Create a connection pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

// Get a single order's details
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        await poolConnect;

        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                SELECT 
                    o.order_id,
                    o.total_amount,
                    o.delivery_address,
                    o.status,
                    o.order_time,
                    r.name as restaurant_name,
                    p.payment_status
                FROM DineAndDash_Orders o
                LEFT JOIN DineAndDash_Restaurants r ON o.restaurant_id = r.restaurant_id
                LEFT JOIN DineAndDash_Payments p ON o.order_id = p.order_id
                WHERE o.order_id = @orderId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all orders for a customer
router.get('/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        await poolConnect;

        const result = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query(`
                SELECT 
                    o.order_id,
                    o.total_amount,
                    o.delivery_address,
                    o.status,
                    o.order_time,
                    r.name as restaurant_name,
                    p.payment_status
                FROM DineAndDash_Orders o
                LEFT JOIN DineAndDash_Restaurants r ON o.restaurant_id = r.restaurant_id
                LEFT JOIN DineAndDash_Payments p ON o.order_id = p.order_id
                WHERE o.customer_id = @customerId
                ORDER BY o.order_time DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching customer orders:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get order items
router.get('/:orderId/items', async (req, res) => {
    try {
        const { orderId } = req.params;
        await poolConnect;

        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                SELECT 
                    oi.quantity,
                    oi.price,
                    m.name as item_name,
                    m.description
                FROM DineAndDash_OrderItems oi
                JOIN DineAndDash_MenuItems m ON oi.item_id = m.item_id
                WHERE oi.order_id = @orderId
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching order items:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel an order
router.put('/:orderId/cancel', async (req, res) => {
    try {
        const { orderId } = req.params;
        await poolConnect;
        
        // First check if the order exists and is in a cancellable state
        const orderCheck = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                SELECT status 
                FROM DineAndDash_Orders 
                WHERE order_id = @orderId
            `);

        if (orderCheck.recordset.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const orderStatus = orderCheck.recordset[0].status;
        if (!['Placed', 'Preparing'].includes(orderStatus)) {
            return res.status(400).json({ 
                error: 'Order cannot be cancelled. Only orders in Placed or Preparing status can be cancelled.' 
            });
        }

        // Update the order status to Cancelled
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                UPDATE DineAndDash_Orders 
                SET status = 'Cancelled'
                WHERE order_id = @orderId;
                
                SELECT 
                    order_id,
                    total_amount,
                    delivery_address,
                    status,
                    order_time
                FROM DineAndDash_Orders 
                WHERE order_id = @orderId;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error cancelling order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        await poolConnect;

        // Validate status
        const validStatuses = ['Placed', 'Preparing', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Update the order status
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .input('status', sql.VarChar, status)
            .query(`
                UPDATE DineAndDash_Orders 
                SET status = @status
                WHERE order_id = @orderId;
                
                SELECT 
                    o.order_id,
                    o.total_amount,
                    o.delivery_address,
                    o.status,
                    o.order_time,
                    r.name as restaurant_name,
                    p.payment_status
                FROM DineAndDash_Orders o
                LEFT JOIN DineAndDash_Restaurants r ON o.restaurant_id = r.restaurant_id
                LEFT JOIN DineAndDash_Payments p ON o.order_id = p.order_id
                WHERE o.order_id = @orderId;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 