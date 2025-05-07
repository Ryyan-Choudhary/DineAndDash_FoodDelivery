import React, { useState, useEffect } from 'react';
import './menu.css';
import { useNavigate, useParams } from 'react-router-dom';

const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { restaurantId } = useParams();

    useEffect(() => {
        const fetchRestaurantAndMenu = async () => {
            try {
                // Fetch restaurant details
                const restaurantResponse = await fetch(`http://localhost:3001/api/restaurants/${restaurantId}`);
                if (!restaurantResponse.ok) {
                    throw new Error(`HTTP error! status: ${restaurantResponse.status}`);
                }
                const restaurantData = await restaurantResponse.json();
                setRestaurant(restaurantData);

                // Fetch menu items
                const menuResponse = await fetch(`http://localhost:3001/api/menu/${restaurantId}`);
                if (!menuResponse.ok) {
                    throw new Error(`HTTP error! status: ${menuResponse.status}`);
                }
                const menuData = await menuResponse.json();
                setMenuItems(menuData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchRestaurantAndMenu();
    }, [restaurantId]);

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
        console.log('Checkout button clicked'); // Debug log
        console.log('Current cart:', cart); // Debug log

        if (cart.length === 0) {
            console.log('Cart is empty'); // Debug log
            alert('Your cart is empty!');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const checkoutData = {
            cartItems: cart,
            total: total,
            restaurantId: restaurantId,
            restaurantName: restaurant?.name
        };

        console.log('Attempting to navigate to checkout with data:', checkoutData); // Debug log
        
        try {
            navigate('/checkout', { 
                state: checkoutData,
                replace: false
            });
            console.log('Navigation completed'); // Debug log
        } catch (error) {
            console.error('Navigation error:', error); // Debug log
        }
    };

    if (loading) {
        return <div className="menu-container">Loading...</div>;
    }

    if (!restaurant) {
        return <div className="menu-container">Restaurant not found</div>;
    }

    return (
        <div className="menu-container">
            <div className="restaurant-header">
                <h1>{restaurant.name}</h1>
                <p className="restaurant-info">
                    <span>{restaurant.location}</span>
                    {restaurant.cuisine_type && (
                        <span className="cuisine-tag">{restaurant.cuisine_type}</span>
                    )}
                </p>
            </div>

            <div className="menu-content">
                <div className="menu-items">
                    {menuItems.map(item => (
                        <div key={item.item_id} className="menu-item">
                            {item.image_url && (
                                <img 
                                    src={item.image_url} 
                                    alt={item.name}
                                    className="menu-item-image"
                                />
                            )}
                            <div className="menu-item-details">
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>
                                <p className="price">${item.price.toFixed(2)}</p>
                                <button onClick={() => addToCart(item)}>Add to Cart</button>
                            </div>
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
                            <button 
                                className="checkout" 
                                onClick={() => {
                                    console.log('Checkout button clicked directly'); // Debug log
                                    handleCheckout();
                                }}
                                disabled={cart.length === 0}
                            >
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