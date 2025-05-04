import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

const OrderStatus = () => {
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pulse, setPulse] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const orderId = location.state?.orderId;

    useEffect(() => {
        if (!orderId) {
            navigate('/menu');
            return;
        }

        const fetchOrderStatus = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/checkout/${orderId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setOrderStatus(data);
                setLoading(false);
                setPulse(true);
                setTimeout(() => setPulse(false), 1000);

                // If order is not delivered or cancelled, keep polling
                if (data.status !== 'Delivered' && data.status !== 'Cancelled') {
                    setTimeout(fetchOrderStatus, 5000); // Poll every 5 seconds
                }
            } catch (error) {
                setError('Failed to fetch order status');
                setLoading(false);
            }
        };

        fetchOrderStatus();
    }, [orderId, navigate]);

    const handleCancelOrder = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/checkout/${orderId}/cancel`, {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to cancel order');
            }

            // Refresh order status
            const statusResponse = await fetch(`http://localhost:3001/api/checkout/${orderId}`);
            const statusData = await statusResponse.json();
            setOrderStatus(statusData);
            setError(''); // Clear any previous errors on success
        } catch (error) {
            setError(error.message);
            // Auto-clear error after 5 seconds
            setTimeout(() => setError(''), 5000);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Placed':
                return '#ff6b35'; // Orange
            case 'Preparing':
                return '#ffc107'; // Yellow
            case 'Picked Up':
                return '#17a2b8'; // Blue
            case 'Out for Delivery':
                return '#28a745'; // Green
            case 'Delivered':
                return '#6c63ff'; // Purple
            case 'Cancelled':
                return '#dc3545'; // Red
            default:
                return '#6c757d'; // Gray
        }
    };

    if (loading) {
        return <div className="order-status-container">Loading order status...</div>;
    }

    if (error) {
        return <div className="order-status-container error">{error}</div>;
    }

    return (
        <div className="order-status-container">
            <h1>Order Status</h1>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            <div className="order-status-card">
                <div className="order-status-header">
                    <h2>Order #{orderStatus.order_id}</h2>
                    <span 
                        className={`order-status-badge ${pulse ? 'pulse' : ''}`}
                        style={{ backgroundColor: getStatusColor(orderStatus.status) }}
                    >
                        {orderStatus.status}
                    </span>
                </div>
                
                <div className="order-details">
                    <div className="order-detail">
                        <span className="detail-label">Total Amount:</span>
                        <span className="detail-value">${orderStatus.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="order-detail">
                        <span className="detail-label">Order Time:</span>
                        <span className="detail-value">
                            {new Date(orderStatus.order_time).toLocaleString()}
                        </span>
                    </div>
                    <div className="order-detail">
                        <span className="detail-label">Delivery Address:</span>
                        <span className="detail-value">{orderStatus.delivery_address}</span>
                    </div>
                </div>

                {orderStatus.status !== 'Delivered' && orderStatus.status !== 'Cancelled' && !orderStatus.rider_id && (
                    <button 
                        className="cancel-order-btn"
                        onClick={handleCancelOrder}
                    >
                        Cancel Order
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderStatus; 