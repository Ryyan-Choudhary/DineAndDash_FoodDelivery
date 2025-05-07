import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './restaurantselect.css';

const RestaurantSelect = () => {
    const [restaurantId, setRestaurantId] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!restaurantId.trim()) {
            setError('Please enter a restaurant ID');
            return;
        }
        navigate(`/menu/${restaurantId}`);
    };

    return (
        <div className="restaurant-select-container">
            <h1>Select Restaurant</h1>
            <form onSubmit={handleSubmit} className="restaurant-select-form">
                <div className="form-group">
                    <input
                        type="text"
                        value={restaurantId}
                        onChange={(e) => setRestaurantId(e.target.value)}
                        placeholder="Enter Restaurant ID"
                        className="restaurant-id-input"
                    />
                    {error && <div className="error-message">{error}</div>}
                </div>
                <button type="submit" className="order-from-btn">
                    Order From Restaurant
                </button>
            </form>
        </div>
    );
};

export default RestaurantSelect; 