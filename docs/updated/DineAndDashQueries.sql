--0 Update user info
--CREATE PROCEDURE Update_UserInfo
--(
--    @user_id INT,
--    @name VARCHAR(100),
--    @email VARCHAR(100),
--    @phone VARCHAR(15),
--    @password VARCHAR(255),
--    @address VARCHAR(255)
--)
--AS
--BEGIN
--    UPDATE DineAndDash_Users
--    SET 
--        name = @name,
--        email = @email,
--        phone = @phone,
--        password = @password,
--        address = @address
--    WHERE user_id = @user_id;
--END

--1 Register a new user
--create procedure Register_User
--(
--@name varchar(100),
--@email varchar(100),
--@password varchar(255),
--@role varchar(20),
--@phone varchar(15),
--@address varchar(255)
--)
--as
--begin
--    insert into DineAndDash_Users (name, email, password, role, phone,address) values (@name, @email, @password, @role, @phone,@address);
--end

--2 Login
--create procedure Login
--(
--@email varchar(100),
--@password varchar(255)
--)
--as
--begin
--    select * from DineAndDash_Users where email=@email AND password=@password
--end

--3 Get user details
--create procedure Get_User_Details
--(
--    @user_id int
--)
--as
--begin
--    select * from DineAndDash_Users where user_id = @user_id;
--end

--4 Get users by role
--create procedure Get_Roles
--(
--	@role varchar(20)
--)
--as
--begin
--	select * from DineAndDash_Users where role=@role
--end

--5 Create new resteraunt
--create procedure Create_Resteraunt
--(
--    @owner_id int,
--    @name varchar(100),
--    @location varchar(255),
--    @cuisine_type varchar(50) = null,
--    @image_url varchar(255) = null
--)
--as
--begin
--    insert into dineanddash_restaurants (owner_id, name, location, cuisine_type, image_url)
--    values (@owner_id, @name, @location, @cuisine_type, @image_url);
--end

--6 Get owned resteraunts
--create procedure Owned_Resteraunts
--(
--    @owner_id int
--)
--as
--begin
--    select restaurant_id, name, location, cuisine_type, rating, image_url from DineAndDash_Restaurants where owner_id = @owner_id;
--end

--7 Delete owned resteraunt
--create procedure Delete_Resteraunt
--(
--    @restaurant_id INT
--)
--as
--begin
--    -- Delete all menu items related to the restaurant
--    delete from dineanddash_menuitems where restaurant_id = @restaurant_id;

--    -- Delete the restaurant itself
--    delete from dineanddash_restaurants where restaurant_id = @restaurant_id;
--end

--8 Get all resteraunts by name, category, name&category
--create procedure Get_Resteraunts
--as
--begin
--    select restaurant_id, name, location, cuisine_type, rating, image_url from dineanddash_restaurants;
--end

--create procedure Search_Name
--(
--    @name_search varchar(100)
--)
--as
--begin
--    select restaurant_id, name, location, cuisine_type, rating, image_url from dineanddash_restaurants where name like '%' + @name_search + '%';
--end

--create procedure Search_Category
--(
--    @category varchar(50)
--)
--as
--begin
--    select restaurant_id, name, location, cuisine_type, rating, image_url
--    from dineanddash_restaurants
--    where cuisine_type = @category;
--end

--create procedure Search_NameandCategory
--(
--    @name_search varchar(100),
--    @category varchar(50)
--)
--as
--begin
--    select restaurant_id, name, location, cuisine_type, rating, image_url
--    from dineanddash_restaurants
--    where name like '%' + @name_search + '%'
--    and cuisine_type = @category;
--end

--9 Search resteraunts by area
--create procedure Search_Area
--(
--    @area_search varchar(255)
--)
--as
--begin
--    select restaurant_id, name, location, cuisine_type, rating, image_url
--    from dineanddash_restaurants
--    where location like '%' + @area_search + '%';
--end

--10 Get menu
--create procedure Resteraunt_Menu
--(
--    @restaurant_id int
--)
--as
--begin
--    select item_id, name, price, description, image_url from dineanddash_menuitems where restaurant_id = @restaurant_id;
--end

--11 Amount of orders today
--select count(*) 
--from DineAndDash_Orders
--where cast(order_time as date) = cast(getdate() as date)

--12 Top n orders by user
--select top (n) u.user_id, u.name, COUNT(o.order_id) AS order_count
--from DineAndDash_Users u
--join DineAndDash_Orders o on u.user_id = o.customer_id
--group by u.user_id, u.name
--order by order_count DESC




--13 Insert menu item
--create procedure Insert_Menu_Item
--    @restaurant_id int,
--    @name varchar(255),
--    @price decimal(10,2),
--    @description varchar(500),
--    @image_url varchar(255)
--as
--begin
--    insert into DineAndDash_MenuItems (restaurant_id, name, price, description, image_url)
--    values (@restaurant_id, @name, @price, @description, @image_url);
--end

--14 Delete menu item
--create procedure Delete_MenuItem
--    @item_id int
--as
--begin
--    delete from DineAndDash_MenuItems
--    where item_id = @item_id;
--end

--15 Update menu item
--create procedure Update_MenuItem
--    @item_id int,
--    @name varchar(255),
--    @price decimal(10,2),
--    @description varchar(500)
--as
--begin
--    update DineAndDash_MenuItems
--    set name = @name, price = @price, description = @description
--    where item_id = @item_id;
--end

--16 Give order
--create procedure Insert_Order
--    @customer_id int,
--    @restaurant_id int,
--    @total_amount decimal(10,2),
--    @add varchar(255)
--as
--begin
--    insert into DineAndDash_Orders (customer_id, restaurant_id, total_amount,delivery_address)
--    values (@customer_id, @restaurant_id, @total_amount,@add);
--end

--17 Delete order
--create procedure Delete_Order
--    @order_id int
--as
--begin
--    delete from DineAndDash_Orders
--    where order_id = @order_id and status = 'Placed';
--end

--18 Add item to order
--create procedure Insert_OrderItem
--    @order_id int,
--    @item_id int,
--    @quantity int,
--    @price decimal(10,2)
--as
--begin
--    insert into DineAndDash_OrderItems (order_id, item_id, quantity, price)
--    values (@order_id, @item_id, @quantity, @price);
--end

--19 View order history
--create procedure View_CustomerOrders
--    @customer_id int
--as
--begin
--    select * from DineAndDash_Orders
--    where customer_id = @customer_id;
--end

--20 Get order details
--create procedure Track_Order
--    @order_id int
--as
--begin
--    select * from DineAndDash_DeliveryTracking
--    where order_id = @order_id;
--end

--21 Assign rider to order
--create procedure Assign_Rider
--    @order_id int,
--    @rider_id int
--as
--begin
--    update DineAndDash_Orders
--    set rider_id = @rider_id
--    where order_id = @order_id;
--end




--22 Update delivery status
--create procedure Update_Delivery
--    @order_id int,
--    @status varchar(50)
--as
--begin
--    update DineAndDash_Orders
--    set status = @status
--    where order_id = @order_id;

--    update DineAndDash_DeliveryTracking
--    set status = @status
--    where order_id = @order_id
--	end

--23 View order payment
--create procedure View_Payments
--    @order_id int
--as
--begin
--    select * from DineAndDash_Payments
--    where order_id = @order_id;
--end

--24 Add payment entry
--create procedure Add_Payment
--    @order_id int,
--    @amount decimal(10, 2),
--    @payment_method varchar(50),
--    @payment_status varchar(20),
--    @transaction_times DATETIME
--as
--begin
--    insert into dineanddash_payments (order_id,amount,payment_method,payment_status,transaction_time)
--    values (@order_id, @amount, @payment_method, @payment_status, @transaction_times);
--end

--25 View payment history
--create procedure View_PaymentHistory
--(
--    @customer_id int
--)
--as
--begin
--    select p.payment_id, p.order_id, p.amount, p.payment_method, p.transaction_time
--    from dineanddash_payments p
--    join dineanddash_orders o on p.order_id = o.order_id
--    where o.customer_id = @customer_id
--    order by p.transaction_time desc;
--end

--26 Add review for restaurant
--create procedure Add_Review
--(
--    @restaurant_id int,
--    @customer_id int,
--    @rating decimal(3,2),
--    @review_text varchar(500)
--)
--as
--begin
--    insert into dineanddash_reviews (restaurant_id, customer_id, rating, comment, review_time)
--    values (@restaurant_id, @customer_id, @rating, @review_text, GETDATE());
--end

--27 View reviews
--create procedure View_Review
--(
--    @restaurant_id int
--)
--as
--begin
--    select r.customer_id, r.rating, r.comment, r.review_time
--    from dineanddash_reviews r
--    where r.restaurant_id = @restaurant_id
--    order by r.review_time desc;
--end

--28 Add deal
--create procedure Add_Deal
--(
--    @deal_name varchar(100),
--    @discount_percentage decimal(5,2),
--    @start_date date,
--    @end_date date,
--    @restaurant_id int
--)
--as
--begin
--    insert into dineanddash_deals (description, discount_percentage, start_date, end_date, restaurant_id)
--    values (@deal_name, @discount_percentage, @start_date, @end_date, @restaurant_id);
--end

--29 Remove deal
--create procedure Remove_Deal
--(
--    @deal_id int
--)
--as
--begin
--    delete from dineanddash_deals
--    where deal_id = @deal_id;
--end

--30 Get active deals
--create procedure Get_ActiveDeals
--as
--begin
--    select d.deal_id, d.description, d.discount_percentage, d.start_date, d.end_date, d.restaurant_id
--    from dineanddash_deals d
--    where d.start_date <= current_date and d.end_date >= current_date
--    order by d.start_date;
--end