const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

// Create a new menu item
router.post('/', menuItemController.createMenuItem);

// Get all menu items for a restaurant
router.get('/restaurant/:restaurantId', menuItemController.getMenuItems);

// Update a menu item
router.put('/:id', menuItemController.updateMenuItem);

// Delete a menu item
router.delete('/:id', menuItemController.deleteMenuItem);

module.exports = router; 