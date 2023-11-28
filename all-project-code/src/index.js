
const express = require('express'); // To build an application server or API
const app = express();
app.use(express.static('public'));
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
var bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.
const { resourceLimits } = require('worker_threads');

// database configuration

const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

let user = {
  password: undefined,
  username: undefined,
  id: undefined,

};


app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

app.get("/", (req, res) => {
  res.render("pages/home");
});

app.get("/register", (req, res) => {
  res.render("pages/register");
});

// Register ---------------------
app.post('/register', async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const username = req.body.username;

    const query = 'INSERT into users (username, password) values ($1, $2) returning *;';
    const data = await db.one(query, [username, hash]);

    console.log(data);
    console.log("test");

    res.status(200).json({
      status: 'success',
      message: 'User registered successfully.',
      user: data  // Include the registered user data in the response if needed
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: 'error',
      message: 'Registration failed. Username already exists.',
      error: err.message  // Include the error message in the response
    });
  }
});


app.get('/login', (req, res) => {
  res.render('pages/login');
});


app.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user_local = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

    if (!user_local) {
      // User not found or incorrect password
      res.status(400).json({
        status: 'error',
        error: 'Incorrect username or password. If you do not have an account, please register.'
      });
    } else {
      const match = await bcrypt.compare(password, user_local.password);

      if (!match) {
        // Password does not match
        res.status(400).json({
          status: 'error',
          error: 'Incorrect username or password. If you do not have an account, please register.'
        });
      } else {

        user.username = user_local.username;
        user.id = user_local.user_id;
        user.password = user_local.password;

        res.status(200).json({

          status: 'success',
          message: 'Welcome!',
          user: user_local  // Include the user data in the response if needed
        });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An internal error occurred. Please try again later.',
      error: error.message  // Include the error message in the response
    });
  }
});




app.get('/business-profile/:id', async (req, res) => {

  const query = 'SELECT * FROM services';
  db.any(query)
    .then((service) => {
      res.render('pages/business', {service});
    });
  const b_id = req.params.id;
  /*const options = {
    method: 'GET',
    url: 'https://local-business-data.p.rapidapi.com/business-details',
    params: {
      business_id: b_id,
      extract_emails_and_contacts: 'true',
      extract_share_link: 'false',
      region: 'us',
      language: 'en'
    },
    headers: {
      'X-RapidAPI-Key': '3490d02908mshfab60b5b1bf7544p19f4c1jsn88730d40dea6',
      'X-RapidAPI-Host': 'local-business-data.p.rapidapi.com'
    }
  };

  try {
    const results = await axios.request(options);
    console.log(results.data);
    res.render('pages/business', {results, serv});
  } catch(error) {
    console.log(error);
    res.render('pages/business', { events: [], error: 'Failed to fetch local businesses' });
  }*/
});

app.get('/service/:id', (req, res) => {

  const s_id = req.params.id;
  const query = 'SELECT * FROM services WHERE service_id = $1';
  db.one(query, [s_id])
    .then((data) => {
      console.log(data);
      res.render('pages/service', {data});
    })
    .catch((err) => {
      console.log(err);
      res.render('pages/service');
    });
});

app.get('/home', (req, res) => {
  res.render('pages/home');
});


app.get('/user-agreement', (req, res) => {
  res.render('pages/user-agreement');
});



app.post('/place-order', async (req, res) => {
  try {
    // retrieve order items from the request
    const orderItems = req.body.orderItems;

    // calculate total from order items
    let total = 0;
    for (const item of orderItems) {
      const servicePayment = await db.one('SELECT payment_amount FROM payments WHERE service_id = $1', [item.service_id]);
      total = servicePayment.payment_amount;
    }

    //insert order details
    const orderQuery = 'INSERT INTO order_details (user_id, total, status) VALUES ($1, $2, $3) RETURNING order_id;';
    const orderInsertResult = await db.one(orderQuery, [user.id, total, 'Pending']);

    // insert order items
    const orderItemsQuery = 'INSERT INTO order_items (order_id, service_id, quantity, total) VALUES ($1, $2, $3, $4);';
    for (const item of orderItems) {
      const servicePayment = await db.one('SELECT payment_amount FROM payments WHERE service_id = $1', [item.service_id]);
      const itemTotal = item.quantity * servicePayment.payment_amount;

      await db.none(orderItemsQuery, [orderInsertResult.order_id, item.service_id, item.quantity, itemTotal]);
    }


    res.status(200).json({
      status: 'success',
      message: 'Order placed successfully.',
      order: orderInsertResult,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({
      status: 'error',
      message: 'An internal error occurred. Please try again later.',
      error: error.message,
    });
  }
});




app.get('/submit-review', (req, res) => {
  res.render('pages/submit-review')
});

app.get('/submit-review', (req, res) => {
  res.render('pages/submit-review')
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

app.get('/discover', (req, res) => {
  const serviceType = req.query.type || 'service';
  axios({
    url: `https://local-business-data.p.rapidapi.com/search`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'X-RapidAPI-Key': '3490d02908mshfab60b5b1bf7544p19f4c1jsn88730d40dea6',
      'X-RapidAPI-Host': 'local-business-data.p.rapidapi.com'
    },
    params: {
      //apikey: process.env.API_KEY,
      query: '${serviceType} in Boulder, Colorado',
      lat: '40.0150',
      lng: '-105.2705',
      zoom: '10',
      limit: '4',
      language: 'en',
      region: 'us'
    },
  })
    .then(results => {
      //console.log(results.data); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
      res.render('pages/discover', { events: results.data.data });
    })
    .catch((err) => {
      // Handle errors
      console.log(err);
      res.render('pages/discover', { events: [], error: 'Failed to fetch local businesses' });
    });
});

app.get('/addbusiness', (req, res) => {
  res.render('pages/addbusiness');
});


app.get('/profile', async (req, res) => {
  try {
    const orderDetailsQuery = 'SELECT * FROM order_details WHERE user_id = $1;';
    const orderDetails = await db.any(orderDetailsQuery, [user.id]);

    console.log('Order Details:', orderDetails);

    const orderItemsQuery = 'SELECT * FROM order_items WHERE order_id = $1;';
    for (const order of orderDetails) {
      order.items = await db.any(orderItemsQuery, [order.order_id]);
      console.log(`Order Items for Order ID ${order.order_id}:`, order.items);
    }

    res.render('pages/profile', { orders: orderDetails });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      status: 'error',
      message: 'An internal error occurred. Please try again later.',
      error: error.message,
    });
  }
});

app.post('/review', (req, res) => {

  const query = `SELECT * FROM business WHERE business.name = '${req.body.business}'`;

  if (req.body.rating < 1 || req.body.rating > 5) {

    res.redirect('/submit-review', { message: "Error: rating must be in the range of 1-5" });



  }

  db.any(query)
    .then((data) => {
      const query1 = `INSERT into review (business_id, user_id, rating, review_test) values (${data[0].business_id}, ${user.id}, ${req.body.rating}, ${req.body.review_text}) returning *;`;
      db.any(query1)
        .then((data) => {
          res.redirect('/business', { message: "Successfully added review" });
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/business', { message: "Error occurred, failed to add review" });
        });



    })
    .catch((err) => {
      console.log(err);
      res.redirect("/home");
    });


});


// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
