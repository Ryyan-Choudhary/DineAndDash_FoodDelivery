import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './searchres.css';

function Searchres() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [filters, setFilters] = useState({
        cuisine: ''
    });

    useEffect(() => {
        fetch('http://localhost:3001/api/restaurants')
            .then((res) => res.json())
            .then((data) => setRestaurants(data))
            .catch((error) => console.error('Error fetching restaurants:', error));
    }, []);

    const handleFilterChange = (cuisine) => {
        setFilters(prev => ({
            ...prev,
            cuisine: prev.cuisine === cuisine ? '' : cuisine
        }));
    };

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('user');
        // Force a storage event to update App component
        window.dispatchEvent(new Event('storage'));
        // Redirect to login page
        navigate('/login');
    };

    const handleViewOrders = () => {
        console.log('Navigating to placed orders...'); // Debug log
        navigate('/placed-orders', { replace: true });
    };

    const filteredRestaurants = restaurants.filter((restaurant) => {
        const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            restaurant.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = !filters.cuisine || restaurant.cuisine_type === filters.cuisine;
        return matchesSearch && matchesFilter;
    });

    const handleRestaurantClick = (restaurantId) => {
        navigate(`/menu/${restaurantId}`);
    };

    // Get unique cuisine types for filter
    const cuisineTypes = [...new Set(restaurants.map(r => r.cuisine_type))].filter(Boolean);

    return (
        <div className="search-restaurants-page">
            {/* Header with Updated Creative Logo */}
            <header className="header">
                <div className="logo-container">
                    <h1 className="logo">
                        DINE <span className="highlight">N</span> DASH
                    </h1>
                </div>
                <div className="header-buttons">
                    <button 
                        className="view-orders-btn" 
                        onClick={handleViewOrders}
                        type="button"
                    >
                        My Orders
                    </button>
                    <button 
                        className="logout-btn"
                        onClick={handleLogout}
                        type="button"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Central Container Box */}
            <div className="central-container">
                {/* Sidebar for Filters */}
                <aside className="filter-sidebar">
                    <h2>Filters</h2>
                    <div className="filter-section">
                        <h3>Cuisine Type</h3>
                        {cuisineTypes.map(cuisine => (
                            <div key={cuisine} className="filter-option">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={filters.cuisine === cuisine}
                                        onChange={() => handleFilterChange(cuisine)}
                                    /> {cuisine}
                                </label>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main List & Search Section */}
                <div className="list-container">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search restaurants by name or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="restaurant-list">
                        {filteredRestaurants.map((restaurant) => (
                            <div 
                                key={restaurant.id} 
                                className="restaurant-card"
                                onClick={() => handleRestaurantClick(restaurant.id)}
                            >
                                {restaurant.image_url && (
                                    <img 
                                        src={restaurant.image_url} 
                                        alt={restaurant.name}
                                        className="restaurant-image"
                                    />
                                )}
                                <div className="restaurant-info">
                                    <h3>{restaurant.name}</h3>
                                    <p className="location">{restaurant.location}</p>
                                    {restaurant.cuisine_type && (
                                        <span className="cuisine-tag">{restaurant.cuisine_type}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Decorative Footer Section */}
            <footer className="footer-decoration">
                <div className="footer-content">
                    <p>Bon Appétit! Explore and enjoy the best dining experience with us.</p>
                </div>
            </footer>
        </div>
    );
}

export default Searchres;
