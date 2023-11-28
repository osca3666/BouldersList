/*
-- Insert data into the users table
INSERT INTO users (username, password) VALUES ('testuser', 'hashedpassword');

-- Insert data into the services table
INSERT INTO services (name, description, cost,logo_url, img_url) VALUES
  ('Lawn Mowing', 'We provide premium lawn care services including: mowing, trimming, and leaf removal.',100,'https://media.istockphoto.com/id/1161894178/vector/lawn-mower-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=nLw0LyFeZ-bsO9ji1BlqGiSPAZQwlNK5R4Nez-3DbEQ=','{"https://hips.hearstapps.com/hmg-prod/images/mower-1568302588.jpg?crop=1.00xw:0.669xh;0,0.318xh&resize=1200:*", "https://contentgrid.homedepot-static.com/hdus/en_US/DTCCOMNEW/Articles/how-to-use-a-string-trimmer-hero.jpg", "https://images.thdstatic.com/productImages/e98ec6bf-a69d-44ee-b0e5-51229de20c17/svn/echo-gas-leaf-blowers-pb-580t-a0_600.jpg"}'),
  ('Lawn Mowing 2', 'We provide more premium lawn care services including: mowing, trimming, and leaf removal.',100,'https://media.istockphoto.com/id/1161894178/vector/lawn-mower-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=nLw0LyFeZ-bsO9ji1BlqGiSPAZQwlNK5R4Nez-3DbEQ=','{"https://hips.hearstapps.com/hmg-prod/images/mower-1568302588.jpg?crop=1.00xw:0.669xh;0,0.318xh&resize=1200:*", "https://contentgrid.homedepot-static.com/hdus/en_US/DTCCOMNEW/Articles/how-to-use-a-string-trimmer-hero.jpg", "https://images.thdstatic.com/productImages/e98ec6bf-a69d-44ee-b0e5-51229de20c17/svn/echo-gas-leaf-blowers-pb-580t-a0_600.jpg"}');

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
*/
