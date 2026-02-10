INSERT INTO products (id, name, description, price, category, imageUrl) VALUES
(1, 'T-Shirt', 'Comfortable cotton t-shirt', 19.99, 'Clothing', 'tshirt.jpg'),
(2, 'Jeans', 'Stylish blue jeans', 49.99, 'Clothing', 'jeans.jpg'),
(3, 'Jacket', 'Warm winter jacket', 89.99, 'Clothing', 'jacket.jpg'),
(4, 'Sneakers', 'Casual sneakers for everyday wear', 59.99, 'Footwear', 'sneakers.jpg'),
(5, 'Hat', 'Stylish baseball cap', 15.99, 'Accessories', 'hat.jpg');

INSERT INTO users (id, username, password, email, role) VALUES
(1, 'john_doe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'john@example.com', 'USER'),
(2, 'jane_smith', '$2a$10$8K2GzVtX8nO6tYvJcH8Ue.4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'jane@example.com', 'USER'),
(3, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'ADMIN');

INSERT INTO orders (id, user_id, total_amount, order_date, status) VALUES
(1, 1, 69.98, '2023-10-01', 'PENDING'),
(2, 2, 19.99, '2023-10-02', 'PENDING');