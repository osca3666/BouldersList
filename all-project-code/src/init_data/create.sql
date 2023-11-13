DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
	user_id SERIAL PRIMARY KEY,
	username VARCHAR(50) UNIQUE NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
 	password_hash VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS business CASCADE;
CREATE TABLE business(
  business_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  phone_number VARCHAR(10),
  description VARCHAR(200) NOT NULL
);

DROP TABLE IF EXISTS services CASCADE;
CREATE TABLE services(
  service_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(200) NOT NULL
);


DROP TABLE IF EXISTS order_details CASCADE;
CREATE TABLE order_details(
   	order_id SERIAL PRIMARY KEY, 
    user_id INTEGER REFERENCES users(user_id),
    total DECIMAL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

DROP TABLE IF EXISTS order_details_to_payments CASCADE;
CREATE TABLE order_details_to_payments(
	payment_id INTEGER REFERENCES payments(payment_id),
	order_id INTEGER REFERENCES order_details(order_id)
);

DROP TABLE IF EXISTS category CASCADE;
CREATE TABLE category(
    	category_id SERIAL PRIMARY KEY,
    	name VARCHAR(50) NOT NULL,
        description VARCHAR(200),
		service_id int
);

DROP TABLE IF EXISTS review CASCADE;
CREATE TABLE review(
    	review_id SERIAL PRIMARY KEY,
    	business_id INT REFERENCES business(business_id),
        user_id INT REFERENCES users(user_id),
		rating INT CHECK (rating >= 1 AND rating <= 5)
);

DROP TABLE IF EXISTS business_to_service CASCADE;
CREATE TABLE business_to_service(
    business_id INTEGER REFERENCES business(business_id),
    service_id INTEGER REFERENCES services(service_id)
);

DROP TABLE IF EXISTS service_to_category CASCADE;
CREATE TABLE service_to_category(
    service_id INTEGER REFERENCES services(service_id),
    category_id INTEGER REFERENCES category(category_id)
);


