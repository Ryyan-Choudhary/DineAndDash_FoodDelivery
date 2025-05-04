const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Place a new order
router.post('/', async (req, res) => {
    const { customer_id, restaurant_id, total_amount, delivery_address, items } = req.body;
    
    try {
        // Create a connection pool
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

        // Start a transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Insert the order
            const orderResult = await transaction.request()
                .input('customer_id', sql.Int, customer_id)
                .input('restaurant_id', sql.Int, restaurant_id)
                .input('total_amount', sql.Decimal(10, 2), total_amount)
                .input('delivery_address', sql.VarChar(255), delivery_address)
                .query(`
                    INSERT INTO DineAndDash_Orders 
                    (customer_id, restaurant_id, total_amount, delivery_address)
                    OUTPUT INSERTED.order_id
                    VALUES (@customer_id, @restaurant_id, @total_amount, @delivery_address)
                `);

            const orderId = orderResult.recordset[0].order_id;

            // Insert order items
            for (const item of items) {
                await transaction.request()
                    .input('order_id', sql.Int, orderId)
                    .input('item_id', sql.Int, item.item_id)
                    .input('quantity', sql.Int, item.quantity)
                    .input('price', sql.Decimal(10, 2), item.price)
                    .query(`
                        INSERT INTO DineAndDash_OrderItems 
                        (order_id, item_id, quantity, price)
                        VALUES (@order_id, @item_id, @quantity, @price)
                    `);
            }

            // Commit the transaction
            await transaction.commit();

            res.json({
                success: true,
                order_id: orderId,
                message: 'Order placed successfully'
            });
        } catch (error) {
            // Rollback the transaction if there's an error
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to place order',
            error: error.message
        });
    }
});

// Get order status
router.get('/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
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
            .input('order_id', sql.Int, orderId)
            .query(`
                SELECT 
                    o.order_id,
                    o.customer_id,
                    o.restaurant_id,
                    o.rider_id,
                    o.total_amount,
                    o.status,
                    o.order_time,
                    o.delivery_address
                FROM DineAndDash_Orders o
                WHERE o.order_id = @order_id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order status',
            error: error.message
        });
    }
});

// Cancel order (only if rider_id is null)
router.post('/:orderId/cancel', async (req, res) => {
    const { orderId } = req.params;

    try {
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

        // First check if rider_id is null
        const checkResult = await pool.request()
            .input('order_id', sql.Int, orderId)
            .query(`
                SELECT rider_id, status
                FROM DineAndDash_Orders
                WHERE order_id = @order_id
            `);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = checkResult.recordset[0];
        
        if (order.rider_id !== null) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order: A rider has already been assigned'
            });
        }

        if (order.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order is already cancelled'
            });
        }

        // Update order status to cancelled
        await pool.request()
            .input('order_id', sql.Int, orderId)
            .query(`
                UPDATE DineAndDash_Orders
                SET status = 'Cancelled'
                WHERE order_id = @order_id
            `);

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
});

module.exports = router; 