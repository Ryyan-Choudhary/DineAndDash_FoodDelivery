require('dotenv').config();  // This should be the very first line
// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const menuRoutes = require('./routes/menu');
const checkoutRoutes = require('./routes/checkoutRoutes');
const restaurantRoutes = require('./routes/restaurant');
const authRoutes = require('./routes/authroutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const riderRoutes = require('./routes/riderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const port = 3001; // You can change the port if needed

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

// Validate database configuration
console.log('Database configuration:', {
    user: config.user,
    server: config.server,
    database: config.database,
    hasPassword: !!config.password
});

// Test database connection
sql.connect(config).then(pool => {
    console.log('Database connection successful');
    pool.close();
}).catch(err => {
    console.error('Database connection failed:', err);
});

// Allow cross-origin requests
app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

// Menu routes
app.use('/api/menu', menuRoutes);
// Checkout routes
app.use('/api/checkout', checkoutRoutes);
// Restaurant routes
app.use('/api/restaurants', restaurantRoutes);
// Auth routes
app.use('/api/auth', authRoutes);
// Menu Item routes
app.use('/api/menu-items', menuItemRoutes);
// Rider routes
app.use('/api/rider', riderRoutes);
// Payment routes
app.use('/api/payments', paymentRoutes);
// Order routes
app.use('/api/orders', orderRoutes);

// Root route redirects to menu page
app.get('/', (req, res) => {
    res.redirect('/menu');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
