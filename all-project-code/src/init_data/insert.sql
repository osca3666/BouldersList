-- Insert data into the users table
INSERT INTO users (username, password) VALUES ('testuser', 'hashedpassword');

-- Insert data into the services table
INSERT INTO services (name, description) VALUES
  ('Service A', 'Description for Service A'),
  ('Service B', 'Description for Service B'),
  ('Service C', 'Description for Service B');

-- Insert data into the payments table
INSERT INTO payments (user_id, service_id, payment_amount, payment_status) VALUES
  (1, 1, 50.00, 'Paid'),
  (1, 2, 75.00, 'Paid');

-- Insert data into the order_details table
INSERT INTO order_details (user_id, payment_id, total) VALUES
  (1, 1, 50.00),
  (1, 2, 75.00);

-- Insert data into the order_items table
INSERT INTO order_items (order_id, service_id, quantity, total) VALUES
  (1, 1, 2, 20.00),
  (1, 2, 1, 30.00),
  (2, 1, 3, 45.00);

