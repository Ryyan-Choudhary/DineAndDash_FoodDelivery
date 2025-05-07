import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        delivery_address: '',
        customer_id: 1, // This should come from your auth system
        payment_method: 'Cash' // Default payment method
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cartData, setCartData] = useState(null);

    useEffect(() => {
        console.log('Checkout location state:', location.state); // Debug log

        if (!location.state) {
            console.log('No location state, redirecting to home'); // Debug log
            navigate('/');
            return;
        }

        const { cartItems, total, restaurantId, restaurantName } = location.state;
        if (!cartItems || !total || !restaurantId) {
            console.log('Missing required data, redirecting to home'); // Debug log
            navigate('/');
            return;
        }

        setCartData({
            items: cartItems,
            total,
            restaurantId,
            restaurantName
        });
    }, [location.state, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cartData) {
            console.log('No cart data available'); // Debug log
            return;
        }

        setLoading(true);
        setError('');

        try {
            const orderData = {
                ...formData,
                restaurant_id: cartData.restaurantId,
                total_amount: cartData.total,
                items: cartData.items.map(item => ({
                    item_id: item.item_id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            console.log('Submitting order data:', orderData); // Debug log

            const response = await fetch('http://localhost:3001/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            console.log('Order response:', data); // Debug log

            if (response.ok) {
                navigate('/order-status', { state: { orderId: data.order_id } });
            } else {
                throw new Error(data.message || 'Failed to place order');
            }
        } catch (err) {
            console.error('Order error:', err); // Debug log
            setError(err.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (!cartData) {
        return <div className="checkout-container">Loading...</div>;
    }

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>
            
            <div className="checkout-content">
                <div className="order-summary">
                    <h2>Order Summary</h2>
                    <h3>{cartData.restaurantName}</h3>
                    {cartData.items.map(item => (
                        <div key={item.item_id} className="order-item">
                            <div className="order-item-details">
                                <span>{item.name}</span>
                                <span className="order-item-quantity">x{item.quantity}</span>
                            </div>
                            <div className="order-item-price">
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                    <div className="order-total">
                        <strong>Total:</strong>
                        <strong>${cartData.total.toFixed(2)}</strong>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="checkout-form">
                    <h2>Delivery Details</h2>
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="delivery_address">Delivery Address</label>
                        <textarea
                            id="delivery_address"
                            name="delivery_address"
                            value={formData.delivery_address}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your delivery address"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="payment_method">Payment Method</label>
                        <select
                            id="payment_method"
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="Cash">Cash on Delivery</option>
                            <option value="Card">Card Payment</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="place-order-btn"
                        disabled={loading}
                    >
                        {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Checkout; 