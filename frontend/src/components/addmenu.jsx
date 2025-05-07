import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './addmenu.css';

const AddMenu = () => {
    const { restaurantId } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image_url: '',
        restaurant_id: localStorage.getItem('restaurantId')
    });

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const restaurantId = localStorage.getItem('restaurantId');
            const response = await axios.get(`http://localhost:3001/api/menu-items/restaurant/${restaurantId}`);
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
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
            const response = await axios.post('http://localhost:3001/api/menu-items', formData);
            if (response.status === 201) {
                alert('Menu item added successfully!');
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    image_url: '',
                    restaurant_id: localStorage.getItem('restaurantId')
                });
                fetchMenuItems(); // Refresh the menu items list
            }
        } catch (error) {
            console.error('Error adding menu item:', error);
            alert('Failed to add menu item. Please try again.');
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            try {
                console.log('Attempting to delete menu item with ID:', itemId);
                const response = await axios.delete(`http://localhost:3001/api/menu-items/${itemId}`);
                console.log('Delete response:', response);
                
                if (response.status === 200) {
                    alert('Menu item deleted successfully!');
                    fetchMenuItems(); // Refresh the menu items list
                } else {
                    throw new Error('Unexpected response status: ' + response.status);
                }
            } catch (error) {
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                alert('Failed to delete menu item. Please try again.');
            }
        }
    };

    return (
        <div className="add-menu-container">
            <h2>Manage Menu Items</h2>
            
            <form onSubmit={handleSubmit} className="add-menu-form">
                <div className="form-group">
                    <label htmlFor="name">Item Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        maxLength={100}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        maxLength={500}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price:</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
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
                        maxLength={255}
                    />
                </div>

                <button type="submit" className="submit-button">Add Menu Item</button>
            </form>

            <div className="menu-items-list">
                <h3>Current Menu Items</h3>
                {menuItems.length === 0 ? (
                    <p>No menu items added yet.</p>
                ) : (
                    <div className="menu-items-grid">
                        {menuItems.map(item => (
                            <div key={item.item_id} className="menu-item-card">
                                {item.image_url && (
                                    <img 
                                        src={item.image_url} 
                                        alt={item.name}
                                        className="menu-item-image"
                                    />
                                )}
                                <div className="menu-item-info">
                                    <h4>{item.name}</h4>
                                    <p className="menu-item-description">{item.description}</p>
                                    <p className="menu-item-price">${parseFloat(item.price).toFixed(2)}</p>
                                    <button 
                                        className="delete-button"
                                        onClick={() => handleDelete(item.item_id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddMenu;
