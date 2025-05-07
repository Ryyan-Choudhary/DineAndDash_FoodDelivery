import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './mngres.css';

const ManageRestaurant = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        cuisine_type: '',
        image_url: ''
    });

    useEffect(() => {
        fetchRestaurantDetails();
    }, [restaurantId]);

    const fetchRestaurantDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/restaurants/${restaurantId}`);
            setRestaurant(response.data);
            setFormData({
                name: response.data.name,
                location: response.data.location,
                cuisine_type: response.data.cuisine_type || '',
                image_url: response.data.image_url || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            setError('Failed to load restaurant details');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3001/api/restaurants/${restaurantId}`, formData);
            if (response.status === 200) {
                setRestaurant(response.data);
                setIsEditing(false);
                alert('Restaurant updated successfully!');
            }
        } catch (error) {
            console.error('Error updating restaurant:', error);
            alert('Failed to update restaurant. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
            try {
                await axios.delete(`http://localhost:3001/api/restaurants/${restaurantId}`);
                alert('Restaurant deleted successfully!');
                navigate('/restaurant-dashboard');
            } catch (error) {
                console.error('Error deleting restaurant:', error);
                alert('Failed to delete restaurant. Please try again.');
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading restaurant details...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="manage-restaurant-container">
            <div className="restaurant-header">
                <h1>{isEditing ? 'Edit Restaurant' : 'Manage Restaurant'}</h1>
                <div className="header-buttons">
                    {!isEditing && (
                        <button 
                            className="edit-button"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Restaurant
                        </button>
                    )}
                    <button 
                        className="delete-button"
                        onClick={handleDelete}
                    >
                        Delete Restaurant
                    </button>
                    <button 
                        className="back-button"
                        onClick={() => navigate('/restaurant-dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label htmlFor="name">Restaurant Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location:</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cuisine_type">Cuisine Type:</label>
                        <input
                            type="text"
                            id="cuisine_type"
                            name="cuisine_type"
                            value={formData.cuisine_type}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image_url">Image URL:</label>
                        <input
                            type="url"
                            id="image_url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="save-button">
                            Save Changes
                        </button>
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    name: restaurant.name,
                                    location: restaurant.location,
                                    cuisine_type: restaurant.cuisine_type || '',
                                    image_url: restaurant.image_url || ''
                                });
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="restaurant-details">
                    {restaurant.image_url && (
                        <img 
                            src={restaurant.image_url} 
                            alt={restaurant.name}
                            className="restaurant-image"
                        />
                    )}
                    <div className="details-content">
                        <h2>{restaurant.name}</h2>
                        <p className="location">📍 {restaurant.location}</p>
                        {restaurant.cuisine_type && (
                            <p className="cuisine">🍽️ {restaurant.cuisine_type}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRestaurant;
