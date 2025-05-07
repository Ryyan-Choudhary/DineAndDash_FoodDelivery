import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './components/menu';
import Checkout from './components/checkout';
import OrderStatus from './components/orderstatus';
import SearchRes from './components/searchres';
import ResOwnerPage from './components/resownerpage';
import Login from './components/login';
import AddRestaurant from './components/addrestaurant';
import AddMenu from './components/addmenu';
import ManageRestaurant from './components/mngres';
import FreeOrdersPage from './components/freeorders';
import UpdateOrderPage from './components/updateorders';
import PlacedOrders from './components/placedorders';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          setIsAuthenticated(true);
          setUserRole(userData.role);
          console.log('User authenticated:', userData); // Debug log
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setIsLoading(false);
    };

    checkAuth();
    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const ProtectedRoute = ({ children, requiredRole }) => {
    console.log('Protected Route Check:', { isAuthenticated, userRole, requiredRole }); // Debug log

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login'); // Debug log
      return <Navigate to="/login" />;
    }

    // For customer routes
    if (requiredRole === 'CUSTOMER') {
      if (userRole !== 'CUSTOMER') {
        console.log('Not a customer, redirecting to appropriate dashboard'); // Debug log
        if (userRole === 'RESTAURANTOWNER') {
          return <Navigate to="/restaurant-dashboard" />;
        } else if (userRole === 'RIDER') {
          return <Navigate to="/rider-dashboard" />;
        }
        return <Navigate to="/login" />;
      }
    }

    // For restaurant owner routes
    if (requiredRole === 'RESTAURANTOWNER') {
      if (userRole !== 'RESTAURANTOWNER') {
        console.log('Not a restaurant owner, redirecting to appropriate page'); // Debug log
        if (userRole === 'CUSTOMER') {
          return <Navigate to="/" />;
        } else if (userRole === 'RIDER') {
          return <Navigate to="/rider-dashboard" />;
        }
        return <Navigate to="/login" />;
      }
    }

    // For rider routes
    if (requiredRole === 'RIDER') {
      if (userRole !== 'RIDER') {
        console.log('Not a rider, redirecting to appropriate page'); // Debug log
        if (userRole === 'CUSTOMER') {
          return <Navigate to="/" />;
        } else if (userRole === 'RESTAURANTOWNER') {
          return <Navigate to="/restaurant-dashboard" />;
        }
        return <Navigate to="/login" />;
      }
    }

    return children;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                userRole === 'RESTAURANTOWNER' ? <Navigate to="/restaurant-dashboard" /> :
                userRole === 'RIDER' ? <Navigate to="/rider-dashboard" /> :
                <Navigate to="/" />
              ) : <Login />
            } 
          />
          {/* Customer Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <SearchRes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/menu/:restaurantId" 
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <Menu />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order-status/:orderId?" 
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <OrderStatus />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/placed-orders" 
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <PlacedOrders />
              </ProtectedRoute>
            } 
          />
          {/* Restaurant Owner Routes */}
          <Route 
            path="/restaurant-dashboard" 
            element={
              <ProtectedRoute requiredRole="RESTAURANTOWNER">
                <ResOwnerPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-restaurant" 
            element={
              <ProtectedRoute requiredRole="RESTAURANTOWNER">
                <AddRestaurant />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-menu" 
            element={
              <ProtectedRoute requiredRole="RESTAURANTOWNER">
                <AddMenu />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-restaurant/:restaurantId" 
            element={
              <ProtectedRoute requiredRole="RESTAURANTOWNER">
                <ManageRestaurant />
              </ProtectedRoute>
            } 
          />
          {/* Rider Routes */}
          <Route 
            path="/rider-dashboard" 
            element={
              <ProtectedRoute requiredRole="RIDER">
                <FreeOrdersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/update-order/:orderId" 
            element={
              <ProtectedRoute requiredRole="RIDER">
                <UpdateOrderPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 