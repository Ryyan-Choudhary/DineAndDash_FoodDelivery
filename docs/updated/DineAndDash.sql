-- Database Schema for DineAndDash (Food Delivery Management System)

--CREATE DATABASE DineAndDash;
--USE DineAndDash;

-- Drop Tables if They Exist to Avoid Duplication Errors
--IF OBJECT_ID('DineAndDash_Users', 'U') IS NOT NULL DROP TABLE DineAndDash_Users;
--IF OBJECT_ID('DineAndDash_Restaurants', 'U') IS NOT NULL DROP TABLE DineAndDash_Restaurants;
--IF OBJECT_ID('DineAndDash_MenuItems', 'U') IS NOT NULL DROP TABLE DineAndDash_MenuItems;
--IF OBJECT_ID('DineAndDash_Orders', 'U') IS NOT NULL DROP TABLE DineAndDash_Orders;
--IF OBJECT_ID('DineAndDash_OrderItems', 'U') IS NOT NULL DROP TABLE DineAndDash_OrderItems;
--IF OBJECT_ID('DineAndDash_Reviews', 'U') IS NOT NULL DROP TABLE DineAndDash_Reviews;
--IF OBJECT_ID('DineAndDash_Deals', 'U') IS NOT NULL DROP TABLE DineAndDash_Deals;
--IF OBJECT_ID('DineAndDash_Payments', 'U') IS NOT NULL DROP TABLE DineAndDash_Payments;
--IF OBJECT_ID('DineAndDash_DeliveryTracking', 'U') IS NOT NULL DROP TABLE DineAndDash_DeliveryTracking;

-- Users Table (Stores all types of users)
CREATE TABLE DineAndDash_Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Customer', 'RestaurantOwner', 'Rider', 'Admin')) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL CHECK (phone like '[0-9]%[0-9]'),
    created_at DATETIME DEFAULT GETDATE(),
	address VARCHAR(255)
);

-- Restaurants Table
CREATE TABLE DineAndDash_Restaurants (
    restaurant_id INT PRIMARY KEY IDENTITY(1,1),
    owner_id INT,
    name VARCHAR(100) NOT NULL,
    location varchar(255) NOT NULL,
    cuisine_type VARCHAR(50),
    image_url VARCHAR(255),
    FOREIGN KEY (owner_id) REFERENCES DineAndDash_Users(user_id) ON DELETE NO ACTION
);

-- Menu Items Table
CREATE TABLE DineAndDash_MenuItems (
    item_id INT PRIMARY KEY IDENTITY(1,1),
    restaurant_id INT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description varchar(500),
    image_url VARCHAR(255),
    FOREIGN KEY (restaurant_id) REFERENCES DineAndDash_Restaurants(restaurant_id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE DineAndDash_Orders (
    order_id INT PRIMARY KEY IDENTITY(1,1),
    customer_id INT,
    restaurant_id INT,
    rider_id INT,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount>0),
    status VARCHAR(20) CHECK (status IN ('Placed', 'Preparing', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled')) DEFAULT 'Placed',
    order_time DATETIME DEFAULT GETDATE(),
	delivery_address varchar(255),
    FOREIGN KEY (customer_id) REFERENCES DineAndDash_Users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (restaurant_id) REFERENCES DineAndDash_Restaurants(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (rider_id) REFERENCES DineAndDash_Users(user_id) ON DELETE SET NULL
);

-- Order Items Table (Stores items in an order)
CREATE TABLE DineAndDash_OrderItems (
    order_item_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT,
    item_id INT,
    quantity INT NOT NULL CHECK (quantity>0),
    price DECIMAL(10,2) NOT NULL CHECK (price>0),
    FOREIGN KEY (order_id) REFERENCES DineAndDash_Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES DineAndDash_MenuItems(item_id) ON DELETE NO ACTION
);

-- Reviews and Ratings Table
CREATE TABLE DineAndDash_Reviews (
    review_id INT PRIMARY KEY IDENTITY(1,1),
    customer_id INT,
    restaurant_id INT,
    rating DECIMAL(3,2) CHECK (rating BETWEEN 1.0 AND 5.0),
    comment varchar(500),
    review_time DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES DineAndDash_Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES DineAndDash_Restaurants(restaurant_id) ON DELETE CASCADE,
	CONSTRAINT unique_review UNIQUE (customer_id, restaurant_id)
);

-- Deals and Discounts Table
CREATE TABLE DineAndDash_Deals (
    deal_id INT PRIMARY KEY IDENTITY(1,1),
    restaurant_id INT,
    description varchar(500) NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES DineAndDash_Restaurants(restaurant_id) ON DELETE CASCADE,
	CONSTRAINT valid_dates CHECK(start_date<=end_date)
);

-- Payment Transactions Table
CREATE TABLE DineAndDash_Payments (
    payment_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('Card', 'Cash')) NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('Pending', 'Completed', 'Failed')) DEFAULT 'Pending',
    transaction_time DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES DineAndDash_Orders(order_id) ON DELETE CASCADE
);
