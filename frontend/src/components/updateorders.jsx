// src/pages/UpdateOrderPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './updateorders.css';

/**
 * @typedef {Object} OrderDetail
 * @property {number} id - The unique order ID.
 * @property {number} bill - The bill amount.
 * @property {string} address - Delivery address.
 * @property {string} orderStatus - Current status of the order.
 * @property {string} paymentStatus - Current payment status.
 * @property {string} [phone] - (Optional) Contact phone number.
 * @property {string} [cuisine] - (Optional) Cuisine information.
 * @property {string} [description] - (Optional) Description of the restaurant.
 * @property {string} [name] - (Optional) Name of the restaurant.
 */

const UpdateOrderPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payment, setPayment] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');

    const statusOptions = [
        'Placed',
        'Preparing',
        'Picked Up',
        'Out for Delivery',
        'Delivered',
        'Cancelled'
    ];

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/orders/${orderId}`);
                setOrder(response.data);
                setSelectedStatus(response.data.status || '');
                setLoading(false);

                // Fetch payment details
                try {
                    const paymentResponse = await axios.get(`http://localhost:3001/api/payments/${orderId}`);
                    console.log('Payment data:', paymentResponse.data); // Debug log
                    setPayment(paymentResponse.data);
                } catch (paymentErr) {
                    console.error('Error fetching payment:', paymentErr);
                    setPayment(null);
                }
            } catch (err) {
                setError('Failed to fetch order details');
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const handleStatusUpdate = async () => {
        try {
            await axios.put(`http://localhost:3001/api/orders/${orderId}/status`, {
                status: selectedStatus
            });

            // If status is Delivered, redirect to free orders page
            if (selectedStatus === 'Delivered') {
                navigate('/rider-dashboard');
                return;
            }

            // Update local state
            setOrder(prev => ({
                ...prev,
                status: selectedStatus
            }));
        } catch (err) {
            setError('Failed to update order status');
        }
    };

    const handlePaymentUpdate = async (newStatus) => {
        try {
            console.log('Updating payment status to:', newStatus); // Debug log
            const response = await axios.put(`http://localhost:3001/api/payments/${orderId}`, {
                payment_status: newStatus // Changed from status to payment_status
            });
            console.log('Payment update response:', response.data); // Debug log

            // Update local state
            setPayment(prev => ({
                ...prev,
                payment_status: newStatus // Changed from status to payment_status
            }));
        } catch (err) {
            console.error('Payment update error:', err); // Debug log
            setError('Failed to update payment status');
        }
    };

    const handleBack = () => {
        navigate('/rider-dashboard');
    };

    if (loading) {
        return <div className="loader">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!order) {
        return <div className="error-message">Order not found</div>;
    }

    const getStatusClass = (status) => {
        if (!status) return '';
        return `status-${status.toLowerCase().replace(' ', '-')}`;
    };

    const getPaymentClass = (status) => {
        if (!status) return '';
        return `payment-${status.toLowerCase()}`;
    };

    return (
        <div className="update-order-container">
            <button className="back-button" onClick={handleBack}>
                ← Back to Free Orders
            </button>

            <div className="order-details">
                <h2>Order #{order.order_id}</h2>
                <div className="detail-item">
                    <span className="detail-label">Restaurant:</span>
                    <span className="detail-value">{order.restaurant_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Delivery Address:</span>
                    <span className="detail-value">{order.delivery_address || 'N/A'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value">${order.total_amount || '0.00'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Current Status:</span>
                    <span className={`detail-value ${getStatusClass(order.status)}`}>
                        {order.status || 'Unknown'}
                    </span>
                </div>
                        </div>

            <div className="status-update-section">
                <h3>Update Order Status</h3>
                                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="status-select"
                >
                    {statusOptions.map(status => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
                <button 
                    onClick={handleStatusUpdate}
                    className="update-status-btn"
                    disabled={selectedStatus === order.status}
                >
                    Update Status
                </button>
            </div>

            {payment && (
                <div className="payment-update-section">
                    <h3>Payment Details</h3>
                    <div className="detail-item">
                        <span className="detail-label">Payment Method:</span>
                        <span className="detail-value">{payment.payment_method || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Payment Status:</span>
                        <span className={`detail-value ${getPaymentClass(payment.payment_status)}`}>
                            {payment.payment_status || 'Unknown'}
                        </span>
                    </div>
                    <div className="payment-actions">
                        {payment.payment_status === 'Pending' && (
                            <>
                                <button 
                                    onClick={() => handlePaymentUpdate('Completed')}
                                    className="payment-complete-btn"
                                >
                                    Mark Payment Complete
                                </button>
                                <button 
                                    onClick={() => handlePaymentUpdate('Failed')}
                                    className="payment-fail-btn"
                                >
                                    Mark Payment Failed
                                </button>
                            </>
                        )}
                        {payment.payment_status === 'Failed' && (
                            <button 
                                onClick={() => handlePaymentUpdate('Completed')}
                                className="payment-complete-btn"
                            >
                                Mark Payment Complete
                            </button>
                        )}
                        {payment.payment_status === 'Completed' && (
                            <button 
                                onClick={() => handlePaymentUpdate('Failed')}
                                className="payment-fail-btn"
                            >
                                Mark Payment Failed
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateOrderPage;
