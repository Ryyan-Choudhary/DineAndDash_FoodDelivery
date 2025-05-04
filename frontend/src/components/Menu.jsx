import React, { useState, useEffect } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/menu/1');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setMenuItems(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching menu items:', error);
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    const addToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.item_id === item.item_id);
            if (existingItem) {
                return prevCart.map(cartItem => 
                    cartItem.item_id === item.item_id 
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.item_id === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(item => 
                    item.item_id === itemId 
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prevCart.filter(item => item.item_id !== itemId);
        });
    };

    const handleCheckout = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        navigate('/checkout', {
            state: {
                cartItems: cart,
                total: total
            }
        });
    };

    if (loading) {
        return <div className="menu-container">Loading...</div>;
    }

    return (
        <div className="menu-container">
            <h1 className="menu-header">Restaurant Menu</h1>
            <div className="menu-content">
                <div className="menu-items">
                    {menuItems.map(item => (
                        <div key={item.item_id} className="menu-item">
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <p>${item.price.toFixed(2)}</p>
                            <button onClick={() => addToCart(item)}>Add to Cart</button>
                        </div>
                    ))}
                </div>

                <div className="cart">
                    <h3>Your Cart</h3>
                    {cart.length === 0 ? (
                        <p>Your cart is empty</p>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.item_id} className="cart-item">
                                    <div className="cart-item-details">
                                        <span>{item.name}</span>
                                        <span className="cart-item-quantity">x{item.quantity}</span>
                                    </div>
                                    <div className="cart-item-actions">
                                        <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                        <button onClick={() => removeFromCart(item.item_id)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                            <div className="cart-total">
                                <strong>Total:</strong>
                                <strong>${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</strong>
                            </div>
                            <button className="checkout" onClick={handleCheckout}>
                                Proceed to Checkout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Menu; 