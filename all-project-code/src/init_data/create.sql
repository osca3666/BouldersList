DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
	user_id SERIAL PRIMARY KEY,
	username VARCHAR(50) UNIQUE NOT NULL,
 	password VARCHAR(255) NOT NULL
);


DROP TABLE IF EXISTS business CASCADE;
CREATE TABLE business(
  business_id SERIAL PRIMARY KEY,
  api_business_id VARCHAR(50) NOT NULL,
  phone_number VARCHAR(10),
  name VARCHAR(200) NOT NULL,
  hours VARCHAR(50) ARRAY [7],
  website VARCHAR(200),
  type VARCHAR(50),
  photo_url VARCHAR(200),
  address VARCHAR(200)
);

DROP TABLE IF EXISTS services CASCADE;
CREATE TABLE services(
  service_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(200) NOT NULL,
  cost INTEGER NOT NULL,
  type VARCHAR(50),
  logo_url VARCHAR(200)
);

DROP TABLE IF EXISTS payments CASCADE;
CREATE TABLE payments(
    	payment_id SERIAL PRIMARY KEY,
    	user_id INTEGER REFERENCES users(user_id),
    	service_id INTEGER REFERENCES services(service_id),
    	payment_amount DECIMAL,
    	payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    	payment_status VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS order_details CASCADE;
CREATE TABLE order_details(
    order_id SERIAL PRIMARY KEY, 
    user_id INTEGER REFERENCES users(user_id),
    payment_id INTEGER REFERENCES payments(payment_id),
    total DECIMAL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending'
);


DROP TABLE IF EXISTS review CASCADE;
CREATE TABLE review(
    review_id SERIAL PRIMARY KEY,
    business_id INT REFERENCES business(business_id),
    user_id INT REFERENCES users(user_id),
		rating INT CHECK (rating >= 1 AND rating <= 5),
		review_text VARCHAR(200)
);

DROP TABLE IF EXISTS business_to_service CASCADE;
CREATE TABLE business_to_service(
    business_id INTEGER REFERENCES business(business_id),
    service_id INTEGER REFERENCES services(service_id)
);


CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES order_details(order_id),
  service_id INTEGER REFERENCES services(service_id),
  quantity INTEGER,
  total DECIMAL
);