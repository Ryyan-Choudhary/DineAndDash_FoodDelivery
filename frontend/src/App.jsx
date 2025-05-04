import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './components/Menu';
import Checkout from './components/Checkout';
import OrderStatus from './components/OrderStatus';
import RestaurantSelect from './components/RestaurantSelect';
import './App.css';

function App() {
  useEffect(() => {
    // Clear any cached routes and local storage
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<RestaurantSelect />} />
          <Route path="/menu/:restaurantId" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-status/:orderId" element={<OrderStatus />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 