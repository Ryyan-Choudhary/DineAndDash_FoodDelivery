import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Menu = () => {
    const { restaurantId } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/menu/${restaurantId}`);
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
    }, [restaurantId]);

    const addToCart = (item) => {
        setCart([...cart, item]);
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const handleCheckout = () => {
        // Implement checkout logic here
        console.log('Proceeding to checkout with items:', cart);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="menu-container">
            <h2>Menu Items</h2>
            <div className="menu-items">
                {menuItems.map(item => (
                    <div key={item.id} className="menu-item">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <p>Price: ${item.price}</p>
                        <button onClick={() => addToCart(item)}>Add to Cart</button>
                    </div>
                ))}
            </div>

            <div className="cart">
                <h3>Your Cart</h3>
                {cart.map(item => (
                    <div key={item.id} className="cart-item">
                        <span>{item.name}</span>
                        <button onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                ))}
                {cart.length > 0 && (
                    <button onClick={handleCheckout}>Proceed to Checkout</button>
                )}
            </div>
        </div>
    );
};

export default Menu; 