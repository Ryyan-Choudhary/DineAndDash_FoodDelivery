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

// Get payment details for an order
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        await poolConnect;
        
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                SELECT payment_id, order_id, amount, payment_method, payment_status, transaction_time
                FROM DineAndDash_Payments
                WHERE order_id = @orderId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update payment status
router.put('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { payment_status } = req.body;

        if (!payment_status || !['Pending', 'Completed', 'Failed'].includes(payment_status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        await poolConnect;
        
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .input('paymentStatus', sql.VarChar, payment_status)
            .query(`
                UPDATE DineAndDash_Payments
                SET payment_status = @paymentStatus
                WHERE order_id = @orderId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Get updated payment details
        const updatedPayment = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                SELECT payment_id, order_id, amount, payment_method, payment_status, transaction_time
                FROM DineAndDash_Payments
                WHERE order_id = @orderId
            `);

        res.json(updatedPayment.recordset[0]);
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Handle cleanup on server shutdown
process.on('SIGINT', async () => {
    try {
        await pool.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (err) {
        console.error('Error closing database connection:', err);
        process.exit(1);
    }
});

module.exports = router; 