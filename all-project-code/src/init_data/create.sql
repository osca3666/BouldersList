DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
	user_id SERIAL PRIMARY KEY,
	username VARCHAR(50) UNIQUE NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
 	password_hash VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS order_details CASCADE;
CREATE TABLE order_details(
   	order_id SERIAL PRIMARY KEY, 
    	user_id INTEGER REFERENCES payments(user_id),
    	total DECIMAL,
    	payment INTEGER REFERENCES payments(payment_id),
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

DROP TABLE IF EXISTS category CASCADE;
CREATE TABLE category(
    	category_id SERIAL PRIMARY KEY,
    	name VARCHAR(50) NOT NULL,
        description VARCHAR(200),
        service_id INTEGER
);

DROP TABLE IF EXISTS review CASCADE;
CREATE TABLE review(
    	review_id SERIAL PRIMARY KEY,
    	business_id INT REFERENCES businesses(business_id),
        user_id INT REFERENCES users(user_id),
		rating INT CHECK (rating >= 1 AND rating <= 5)
);
