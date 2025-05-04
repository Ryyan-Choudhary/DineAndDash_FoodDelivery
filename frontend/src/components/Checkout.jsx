import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, total } = location.state || { cartItems: [], total: 0 };
    
    const [formData, setFormData] = useState({
        delivery_address: '',
        customer_id: 1, // This should come from your auth system
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const orderData = {
                ...formData,
                restaurant_id: cartItems[0]?.restaurant_id,
                total_amount: total,
                items: cartItems.map(item => ({
                    item_id: item.item_id,
                    quantity: 1, // You might want to add quantity in your cart
                    price: item.price
                }))
            };

            const response = await fetch('http://localhost:3001/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (data.success) {
                navigate('/order-status', { 
                    state: { orderId: data.order_id }
                });
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (!cartItems.length) {
        return <div className="checkout-container">No items in cart</div>;
    }

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>
            
            <div className="checkout-content">
                <div className="order-summary">
                    <h2>Order Summary</h2>
                    {cartItems.map(item => (
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
                        <strong>${total.toFixed(2)}</strong>
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