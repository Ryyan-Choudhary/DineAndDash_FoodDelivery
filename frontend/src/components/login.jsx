import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER' // default role is CUSTOMER
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (isSignUp) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (formData.name.length > 20) {
        newErrors.name = 'Name must be at most 20 characters';
      }

      const phoneRegex = /^03\d{9}$/;
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Enter a valid Pakistani number (03XXXXXXXXX)';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'CUSTOMER'
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
        console.log('Submitting auth request:', { endpoint, formData }); // Debug log

        const response = await fetch(`http://localhost:3001${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        console.log('Auth response:', data); // Debug log

        if (response.ok) {
          // Ensure we have the complete user data
          if (!data.user || !data.user.id || !data.user.role) {
            throw new Error('Invalid user data received from server');
          }

          // Store user info in localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('User data stored:', data.user); // Debug log

          // Force a storage event to update App component
          window.dispatchEvent(new Event('storage'));

          // Redirect based on role
          const userRole = data.user.role;
          console.log('User role for redirection:', userRole); // Debug log

          switch (userRole) {
            case 'RESTAURANTOWNER':
              navigate('/restaurant-dashboard');
              break;
            case 'RIDER':
              navigate('/rider-dashboard');
              break;
            case 'CUSTOMER':
              navigate('/');
              break;
            default:
              console.error('Unknown role:', userRole);
              // If role is unknown, redirect to login
              setErrors({ submit: 'Invalid user role. Please try again.' });
              localStorage.removeItem('user');
              window.dispatchEvent(new Event('storage'));
          }
        } else {
          // Handle role mismatch error specifically
          if (response.status === 403) {
            setErrors({ submit: data.message });
          } else {
            setErrors({ submit: data.message || 'Invalid credentials' });
          }
        }
      } catch (error) {
        console.error('Auth error:', error); // Debug log
        setErrors({ submit: error.message || 'An error occurred. Please try again.' });
      }
    }
  };

  // Add role-specific form rendering
  const renderRoleSpecificFields = () => {
    if (formData.role === 'CUSTOMER') {
      return (
        <div className="role-info">
          <p>As a customer, you can:</p>
          <ul>
            <li>Search and browse restaurants</li>
            <li>Place food orders</li>
            <li>Track your order status</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='auth-container'>
      <img src="/assets/dine.png" alt="Dine Logo" className="auth-logo" />
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>

        {errors.submit && <p className="error">{errors.submit}</p>}

        {/* Role Dropdown moved to the top */}
        <label htmlFor="role">Select Role</label>
        <select
          name="role"
          id="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="CUSTOMER">Customer</option>
          <option value="RESTAURANTOWNER">Restaurant Owner</option>
          <option value="RIDER">Rider</option>
        </select>

        {renderRoleSpecificFields()}

        {isSignUp && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              maxLength={20}
              required
            />
            {errors.name && <p className="error">{errors.name}</p>}

            <input
              type="text"
              name="phone"
              placeholder="Phone Number (03XXXXXXXXX)"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {errors.phone && <p className="error">{errors.phone}</p>}
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {isSignUp && (
          <>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </>
        )}

        <button type="submit" className="auth-button">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        <p className="toggle-auth">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={handleToggle} className="toggle-button">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
