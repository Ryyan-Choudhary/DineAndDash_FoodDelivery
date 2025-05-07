import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './resownerpage.css';

const ResOwnerPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('Current user data:', user); // Debug log

            if (!user || !user.id) {
                console.error('Invalid user data:', user); // Debug log
                throw new Error('User not found or invalid user data');
            }

            console.log('Fetching restaurants for user ID:', user.id); // Debug log
            const response = await fetch(`http://localhost:3001/api/restaurants/owner/${user.id}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch restaurants');
            }

            const data = await response.json();
            console.log('Fetched restaurants:', data); // Debug log
            setRestaurants(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError(error.message || 'Failed to load restaurants');
            setLoading(false);
        }
    };

    const handleAddRestaurant = () => {
        navigate('/add-restaurant');
    };

    const handleAddMenu = (restaurantId) => {
        localStorage.setItem('restaurantId', restaurantId);
        navigate('/add-menu');
    };

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('user');
        // Force a storage event to update App component
        window.dispatchEvent(new Event('storage'));
        // Redirect to login page
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="resowner-container">
                <div className="loading-message">Loading your restaurants...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="resowner-container">
                <div className="error-message">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchRestaurants} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="resowner-container">
            <div className="resowner-header">
                <h1>My Restaurants</h1>
                <div className="header-buttons">
                    <button 
                        className="add-restaurant-btn"
                        onClick={handleAddRestaurant}
                    >
                        Add New Restaurant
                    </button>
                    <button 
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="restaurants-grid">
                {restaurants.length === 0 ? (
                    <div className="no-restaurants">
                        <p>You haven't added any restaurants yet.</p>
                        <p>Click the button above to add your first restaurant!</p>
                    </div>
                ) : (
                    restaurants.map(restaurant => (
                        <div key={restaurant.restaurant_id} className="restaurant-card">
                            {restaurant.image_url && (
                                <img 
                                    src={restaurant.image_url} 
                                    alt={restaurant.name}
                                    className="restaurant-image"
                                />
                            )}
                            <div className="restaurant-info">
                                <h2>{restaurant.name}</h2>
                                <p className="restaurant-location">{restaurant.location}</p>
                                {restaurant.cuisine_type && (
                                    <span className="cuisine-tag">{restaurant.cuisine_type}</span>
                                )}
                                <div className="restaurant-stats">
                                    <span>Rating: {restaurant.rating || 'N/A'}</span>
                                    <span>Orders: {restaurant.total_orders || 0}</span>
                                </div>
                                <div className="restaurant-actions">
                                    <button 
                                        className="manage-btn"
                                        onClick={() => navigate(`/manage-restaurant/${restaurant.restaurant_id}`)}
                                    >
                                        Manage Restaurant
                                    </button>
                                    <button 
                                        className="menu-btn"
                                        onClick={() => handleAddMenu(restaurant.restaurant_id)}
                                    >
                                        Manage Menu
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ResOwnerPage;
