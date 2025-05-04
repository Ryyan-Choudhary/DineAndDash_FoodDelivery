// app.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './pages/menu';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Navigate to="/menu" replace />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/menu/:restaurantId" element={<Menu />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
