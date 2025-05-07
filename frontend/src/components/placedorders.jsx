import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './placedorders.css';

const PlacedOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (!userData) {
                    navigate('/login');
                    return;
                }

                const { id: customerId } = JSON.parse(userData);
                if (!customerId) {
                    navigate('/login');
                    return;
                }

                console.log('Fetching orders for customer:', customerId); // Debug log
                const response = await axios.get(`http://localhost:3001/api/orders/customer/${customerId}`);
                console.log('Orders response:', response.data); // Debug log
                setOrders(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching orders:', err); // Debug log
                setError('Failed to fetch orders. Please try again later.');
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    const handleOrderClick = async (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3001/api/orders/${orderId}/items`);
            const updatedOrders = orders.map(order => {
                if (order.order_id === orderId) {
                    return { ...order, items: response.data };
                }
                return order;
            });
            setOrders(updatedOrders);
            setExpandedOrder(orderId);
        } catch (err) {
            setError('Failed to fetch order details. Please try again later.');
        }
    };

    const handleCancelOrder = async (orderId, event) => {
        event.stopPropagation(); // Prevent the order card from expanding
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            await axios.put(`http://localhost:3001/api/orders/${orderId}/cancel`);
            // Update the order status in the local state
            setOrders(orders.map(order => {
                if (order.order_id === orderId) {
                    return { ...order, status: 'Cancelled' };
                }
                return order;
            }));
        } catch (err) {
            setError('Failed to cancel order. Please try again later.');
        }
    };

    const isOrderCancellable = (status) => {
        return ['Placed', 'Preparing'].includes(status);
    };

    const getStatusClass = (status) => {
        return `status-badge status-${status.toLowerCase().replace(' ', '-')}`;
    };

    const getPaymentClass = (status) => {
        if (!status) return 'payment-badge payment-pending';
        return `payment-badge payment-${status.toLowerCase()}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className="placed-orders-container">
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="placed-orders-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="placed-orders-container">
            <div className="placed-orders-header">
                <h1 className="placed-orders-title">My Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <p>You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div
                            key={order.order_id}
                            className="order-card"
                            onClick={() => handleOrderClick(order.order_id)}
                        >
                            <div className="order-header">
                                <div className="order-restaurant">{order.restaurant_name}</div>
                                <div className="order-time">{formatDate(order.order_time)}</div>
                            </div>

                            <div className="order-details">
                                <div className="detail-item">
                                    <span className="detail-label">Order ID</span>
                                    <span className="detail-value">#{order.order_id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Total Amount</span>
                                    <span className="detail-value">${order.total_amount}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Status</span>
                                    <span className={`detail-value ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Payment</span>
                                    <span className={`detail-value ${getPaymentClass(order.payment_status)}`}>
                                        {order.payment_status}
                                    </span>
                                </div>
                            </div>

                            {isOrderCancellable(order.status) && (
                                <button 
                                    className="cancel-order-btn"
                                    onClick={(e) => handleCancelOrder(order.order_id, e)}
                                >
                                    Cancel Order
                                </button>
                            )}

                            {expandedOrder === order.order_id && order.items && (
                                <div className="order-items">
                                    <h3 className="items-title">Order Items</h3>
                                    <div className="items-list">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="item-row">
                                                <span className="item-name">{item.item_name}</span>
                                                <span className="item-quantity">x{item.quantity}</span>
                                                <span className="item-price">${item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlacedOrders; 