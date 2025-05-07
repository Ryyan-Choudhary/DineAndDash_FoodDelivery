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

// Create a new order
router.post('/', async (req, res) => {
    const transaction = new sql.Transaction(await sql.connect(config));
    
    try {
        await transaction.begin();
        
        const { 
            customer_id, 
            restaurant_id, 
            total_amount, 
            delivery_address,
            payment_method,
            items 
        } = req.body;

        // Insert order
        const orderResult = await transaction.request()
            .input('customerId', sql.Int, customer_id)
            .input('restaurantId', sql.Int, restaurant_id)
            .input('totalAmount', sql.Decimal(10, 2), total_amount)
            .input('deliveryAddress', sql.VarChar, delivery_address)
            .input('status', sql.VarChar, 'Placed')
            .query(`
                INSERT INTO DineAndDash_Orders (customer_id, restaurant_id, total_amount, delivery_address, status)
                OUTPUT INSERTED.order_id
                VALUES (@customerId, @restaurantId, @totalAmount, @deliveryAddress, @status)
            `);

        const orderId = orderResult.recordset[0].order_id;

        // Insert order items
        for (const item of items) {
            await transaction.request()
                .input('orderId', sql.Int, orderId)
                .input('itemId', sql.Int, item.item_id)
                .input('quantity', sql.Int, item.quantity)
                .input('price', sql.Decimal(10, 2), item.price)
                .query(`
                    INSERT INTO DineAndDash_OrderItems (order_id, item_id, quantity, price)
                    VALUES (@orderId, @itemId, @quantity, @price)
                `);
        }

        // Create payment record
        await transaction.request()
            .input('orderId', sql.Int, orderId)
            .input('amount', sql.Decimal(10, 2), total_amount)
            .input('paymentMethod', sql.VarChar, payment_method)
            .input('paymentStatus', sql.VarChar, 'Pending')
            .query(`
                INSERT INTO DineAndDash_Payments (order_id, amount, payment_method, payment_status)
                VALUES (@orderId, @amount, @paymentMethod, @paymentStatus)
            `);

        await transaction.commit();

        res.status(201).json({ 
            message: 'Order placed successfully',
            order_id: orderId
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get order details
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const pool = await sql.connect(config);
        
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                SELECT o.*, r.name as restaurant_name
                FROM DineAndDash_Orders o
                JOIN DineAndDash_Restaurants r ON o.restaurant_id = r.restaurant_id
                WHERE o.order_id = @orderId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update order status
router.put('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status || !['Placed', 'Preparing', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

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
            return res.status(404).json({ message: 'Order not found' });
        }

        // Get updated order details
        const updatedOrder = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                SELECT o.*, r.name as restaurant_name
                FROM DineAndDash_Orders o
                JOIN DineAndDash_Restaurants r ON o.restaurant_id = r.restaurant_id
                WHERE o.order_id = @orderId
            `);

        res.json(updatedOrder.recordset[0]);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel order
router.post('/:orderId/cancel', async (req, res) => {
    try {
        const { orderId } = req.params;
        const pool = await sql.connect(config);
        
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                UPDATE DineAndDash_Orders
                SET status = 'Cancelled'
                WHERE order_id = @orderId AND status NOT IN ('Delivered', 'Cancelled')
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(400).json({ message: 'Order cannot be cancelled' });
        }

        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 