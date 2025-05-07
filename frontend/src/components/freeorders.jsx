// src/pages/FreeOrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './freeorders.css';

/**
 * @typedef {Object} Order
 * @property {number} order_id - The unique order ID.
 * @property {number} total_amount - The bill amount.
 * @property {string} delivery_address - The order address.
 * @property {string} status - The current status of the order.
 * @property {string} order_time - The time when the order was placed.
 */

function FreeOrdersPage() {
    const [orders, setOrders] = useState(
        /** @type {Order[]} */ ([])
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/rider/freeOrders');
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching free orders:", error);
            setError("Failed to load orders. Please try again.");
            setLoading(false);
        }
    };

    const handlePickup = async (orderId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.id) {
                throw new Error('User not found');
            }

            await axios.put(`http://localhost:3001/api/rider/pickup-order/${orderId}`, {
                riderId: user.id
            });

            // Refresh the orders list
            fetchOrders();
            
            // Navigate to update order page
            navigate(`/update-order/${orderId}`);
        } catch (error) {
            console.error("Error picking up order:", error);
            setError("Failed to pick up order. Please try again.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        navigate('/login');
    };

    return (
        <div className="free-orders-page">
            <header className="page-header">
                <h1>Available Orders</h1>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>
            {error && <div className="error-message">{error}</div>}
            <div className="orders-container">
                {loading ? (
                    <div className="loader">Loading orders...</div>
                ) : orders.length > 0 ? (
                    orders.map((order) => (
                        <div
                            key={order.order_id}
                            className="order-card"
                        >
                            <h3>Order #{order.order_id}</h3>
                            <p>
                                <strong>Amount:</strong> ${order.total_amount}
                            </p>
                            <p>
                                <strong>Address:</strong> {order.delivery_address}
                            </p>
                            <p>
                                <strong>Status:</strong> {order.status}
                            </p>
                            <p>
                                <strong>Order Time:</strong> {new Date(order.order_time).toLocaleString()}
                            </p>
                            <button 
                                className="pickup-btn"
                                onClick={() => handlePickup(order.order_id)}
                            >
                                Pick Up Order
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No free orders available.</p>
                )}
            </div>
        </div>
    );
}

export default FreeOrdersPage;
