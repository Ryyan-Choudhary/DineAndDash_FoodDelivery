import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './addrestaurant.css';

const AddRestaurant = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        cuisine_type: '',
        image_url: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.id) {
                throw new Error('User not found');
            }

            const response = await fetch('http://localhost:3001/api/restaurants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    owner_id: user.id
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add restaurant');
            }

            // Redirect back to restaurant dashboard on success
            navigate('/restaurant-dashboard');
        } catch (err) {
            setError(err.message || 'An error occurred while adding the restaurant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-restaurant-container">
            <div className="add-restaurant-form-container">
                <h1>Add New Restaurant</h1>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="add-restaurant-form">
                    <div className="form-group">
                        <label htmlFor="name">Restaurant Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter restaurant name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="Enter restaurant location"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cuisine_type">Cuisine Type</label>
                        <select
                            id="cuisine_type"
                            name="cuisine_type"
                            value={formData.cuisine_type}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select cuisine type</option>
                            <option value="Italian">Italian</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Indian">Indian</option>
                            <option value="Mexican">Mexican</option>
                            <option value="American">American</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Thai">Thai</option>
                            <option value="Mediterranean">Mediterranean</option>
                            <option value="Fast Food">Fast Food</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="image_url">Image URL</label>
                        <input
                            type="url"
                            id="image_url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            placeholder="Enter image URL (optional)"
                        />
                    </div>

                    <div className="form-buttons">
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Adding Restaurant...' : 'Add Restaurant'}
                        </button>
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => navigate('/restaurant-dashboard')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRestaurant; 