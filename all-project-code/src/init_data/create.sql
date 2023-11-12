<<<<<<< HEAD
=======


>>>>>>> bfa9cb847768274767b1ae6b516ca2e12b7724ae
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
	user_id SERIAL PRIMARY KEY,
	username VARCHAR(50) UNIQUE NOT NULL,
	email VARCHAR(50) UNIQUE NOT NULL,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
 	password_hash VARCHAR(255) NOT NULL
);
<<<<<<< HEAD

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
=======
>>>>>>> bfa9cb847768274767b1ae6b516ca2e12b7724ae
